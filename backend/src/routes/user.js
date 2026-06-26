const express = require('express');
const router = express.Router();
const pool = require('../db/index');
const UX_CODES = require('../constants/ux-codes');
const RECOVERY_POLICY = require('../constants/recovery-policy');
const { requirePrivilege, ROLES, RISK_LEVELS } = require('../middleware/actor');
const { getPerception } = require('../reality/perception');
const { getPriority } = require('../reality/scorer');
const { getHealEligibility } = require('../reality/healer');
const { composeReality, generateMetadata } = require('../reality/contract');

// Reality Engine dependencies
const ConfigService = require('../services/config.service');
const reputationService = require('../services/reputation.service');
const { ethers } = require('ethers');

/**
 * 🛡️ [AUTHORITATIVE] User State Orchestrator
 * Responsibility: Aggregate and compose active journey states into a prioritized reality.
 * Route: GET /api/user/state
 */
router.get('/state', requirePrivilege({ capability: 'USERS_READ', minRole: ROLES.OWNER, risk: RISK_LEVELS.LOW }), async (req, res) => {
    const actor = req.actor;
    const now = new Date();

    try {
        // 1. PHASE_A: RAW FETCH (Parallel Scan)
        const [intentsRes, docsRes] = await Promise.all([
            pool.query(
                `SELECT *, created_at as started_at FROM upload_intents 
                 WHERE user_id = $1 AND status NOT IN ('COMPLETED', 'EXPIRED', 'FAILED_FINAL')`,
                [actor.id]
            ),
            pool.query(
                // Include documents that are in-progress OR recently completed/approved (within 24h window)
                // This allows the owner to see the RewardPrimary success state after notarization
                `SELECT *, created_at as started_at FROM documents 
                 WHERE user_id = $1
                   AND is_deleted = false
                   AND (
                     submission_state NOT IN ('completed', 'rejected')
                     OR (
                       submission_state = 'completed'
                       AND COALESCE(status_updated_at, updated_at) > NOW() - INTERVAL '24 hours'
                     )
                   )`,
                [actor.id]
            )
        ]);

        const allItems = [];

        // 2. PHASE_B: TRANSFORMATION & HEALING
        // ── Process Intents ──
        for (const intent of intentsRes.rows) {
            const elapsed_ms = now - new Date(intent.started_at);
            const uxCode = mapIntentToUXCode(intent);
            const perception = getPerception(uxCode, elapsed_ms);
            
            // Healing Decision Logic
            const eligibility = getHealEligibility(intent, intent.payment_tx_hash ? 'CHAIN' : 'USER_ACTION', perception);
            
            if (eligibility.canHeal && intent.payment_tx_hash) {
                const healed = await healIntent(intent, eligibility);
                if (healed) {
                    const { incrementGlobalHeal } = require('../reality/healer');
                    incrementGlobalHeal();
                }
            } else if (eligibility.terminal) {
                await markTerminal(intent, 'intent');
            }

            allItems.push({
                flow_id: `intent_${intent.id}`,
                type: 'DOCUMENT_UPLOAD',
                raw: intent,
                uxCode,
                perception,
                elapsed_ms,
                priority: getPriority(uxCode, elapsed_ms),
                is_blocking: true, // Intents always block upload flow
                can_dismiss: false,
                retry_allowed: eligibility.canHeal,
                retry_after: eligibility.canHeal ? Math.ceil(RECOVERY_POLICY.CHAIN.COOLDOWN_MS / 1000) : null,
                state: intent.status,
                details: {
                    intent_id: intent.id,
                    filename: intent.filename,
                    amount: intent.amount
                }
            });
        }

        // ── Process Documents ──
// ... existing documents for loop ...
        for (const doc of docsRes.rows) {
            const elapsed_ms = now - new Date(doc.started_at);
            const uxCode = mapDocToUXCode(doc);
            const perception = getPerception(uxCode, elapsed_ms);
            
            // Healing Decision Logic
            const policyClass = doc.submission_state === 'pending' ? 'ASSIGNMENT' : 'CHAIN';
            const eligibility = getHealEligibility(doc, policyClass, perception);

            if (eligibility.canHeal) {
                const healed = await healDocument(doc, policyClass, eligibility);
                if (healed) {
                    const { incrementGlobalHeal } = require('../reality/healer');
                    incrementGlobalHeal();
                }
            } else if (eligibility.terminal) {
                await markTerminal(doc, 'document');
            }

            allItems.push({
                flow_id: `doc_${doc.id}`,
                type: 'DOCUMENT_NOTARIZATION',
                raw: doc,
                uxCode,
                perception,
                elapsed_ms,
                priority: getPriority(uxCode, elapsed_ms),
                is_blocking: doc.submission_state !== 'pending', // Pending assignments are secondary
                can_dismiss: false,
                retry_allowed: eligibility.canHeal,
                retry_after: eligibility.canHeal ? Math.ceil(RECOVERY_POLICY[policyClass].COOLDOWN_MS / 1000) : null,
                state: doc.submission_state,
                details: {
                    doc_id: doc.id,
                    filename: doc.filename,
                    title: doc.title || doc.filename,
                    notary_id: doc.notary_id,
                    tx_hash: doc.approval_tx_hash || doc.tx_hash || null,
                    file_hash: doc.file_hash || null,
                    notary_wallet: doc.notary_wallet || null,
                    chain_confirmed: doc.chain_confirmed || false,
                    submission_state: doc.submission_state
                }
            });
        }

        // 3. PHASE_C: COMPOSITION & SCORING
        // [PHASE_8.5] Split Logic: Primary (Impact) vs Blocking (Urgency)
        // Sort everything by priority first
        allItems.sort((a, b) => b.priority - a.priority);

        // Primary: Highest impact reward (100) or critical failure (90)
        const primaryItem = allItems.find(i => i.priority >= 90);
        
        // Blocking: Highest urgency action-required item (80+) if not already primary
        const blockingItem = allItems.find(i => 
            i.priority >= 80 && i.priority < 100 && i.flow_id !== (primaryItem?.flow_id)
        );

        // Secondary: The rest
        const secondaryItems = allItems.filter(i => 
            i.flow_id !== primaryItem?.flow_id && i.flow_id !== blockingItem?.flow_id
        );

        res.json({
            primary: primaryItem ? composeReality(primaryItem) : null,
            blocking: blockingItem ? composeReality(blockingItem) : null,
            secondary: secondaryItems.map(item => composeReality(item)),
            meta: generateMetadata(primaryItem ? 'STRONG' : 'EVENTUAL')
        });

    } catch (err) {
        console.error('[USER_STATE_CRITICAL]', err);
        res.status(500).json({ error: 'Failed to reconstruct user state' });
    }
});
/**
 * mapDocToUXCode
 * Maps a document's raw submission_state to the authoritative UX identity code.
 */
function mapDocToUXCode(doc) {
    if (doc.submission_state === 'completed' || doc.chain_confirmed) return UX_CODES.CHAIN_TX_CONFIRMED;
    if (doc.submission_state === 'submitted_to_blockchain') return UX_CODES.CHAIN_TX_PENDING;
    if (doc.submission_state === 'rejected') return UX_CODES.NOTARY_REJECTED;
    // Time-aware: if pending assignment for >2min, flag as delayed
    const elapsed = Date.now() - new Date(doc.started_at || doc.created_at).getTime();
    if (doc.submission_state === 'pending' && elapsed > 120000) return UX_CODES.CHAIN_SYNC_DELAYED;
    return UX_CODES.NOTARY_ASSIGNMENT_PENDING;
}

/**
 * mapIntentToUXCode
 * Maps an upload intent's raw status to the authoritative UX identity code.
 */
function mapIntentToUXCode(intent) {
    if (intent.status === 'PAYMENT_PENDING') return UX_CODES.INTENT_PAYMENT_PENDING;
    if (intent.status === 'PAYMENT_VERIFIED') return UX_CODES.INTENT_PAYMENT_VERIFIED;
    if (intent.status === 'DOC_SYNC_PENDING') return UX_CODES.INTENT_DOC_SYNC_PENDING;
    return UX_CODES.INTENT_CREATED;
}
/**
 * healIntent
 * Aggressive auto-verification with cycle-aware reset logic.
 */
async function healIntent(intent, eligibility) {
    try {
        const policy = RECOVERY_POLICY.CHAIN;
        const now = new Date();
        const resetAt = new Date(now.getTime() + policy.WINDOW_RESET_MS);

        if (eligibility.resetNeeded) {
            await pool.query(
                `UPDATE upload_intents 
                 SET auto_retry_count = 0, 
                     total_retry_cycles = total_retry_cycles + 1, 
                     retry_window_reset_at = $1,
                     last_auto_retry_at = NOW() 
                 WHERE id = $2`,
                [resetAt, intent.id]
            );
            return true;
        } else {
            // Normal increment
            const config = await ConfigService.getConfig();
            const ProviderService = require('../blockchain/provider-service');
            const provider = await ProviderService.getProvider();
            const receipt = await provider.getTransactionReceipt(intent.payment_tx_hash);

            if (receipt && receipt.status === 1) {
                await pool.query(
                    `UPDATE upload_intents SET auto_retry_count = auto_retry_count + 1, last_auto_retry_at = NOW() WHERE id = $1`,
                    [intent.id]
                );
                return true;
            }
        }
    } catch (e) {
        console.error(`[HEAL_INTENT_FAIL] intent=${intent.id} | ${e.message}`);
    }
    return false;
}

/**
 * healDocument
 * Aggressive re-triggering with cycle-aware reset logic.
 */
async function healDocument(doc, policyClass, eligibility) {
    try {
        const policy = RECOVERY_POLICY[policyClass];
        const now = new Date();
        const resetAt = new Date(now.getTime() + policy.WINDOW_RESET_MS);

        if (eligibility.resetNeeded) {
            await pool.query(
                `UPDATE documents 
                 SET auto_retry_count = 0, 
                     total_retry_cycles = total_retry_cycles + 1, 
                     retry_window_reset_at = $1,
                     last_auto_retry_at = NOW() 
                 WHERE id = $2`,
                [resetAt, doc.id]
            );
            return true;
        } else {
            if (policyClass === 'ASSIGNMENT') {
                await reputationService.assignNotary(doc.id);
            }
            await pool.query(
                `UPDATE documents SET auto_retry_count = auto_retry_count + 1, last_auto_retry_at = NOW() WHERE id = $1`,
                [doc.id]
            );
            return true;
        }
    } catch (e) {
        console.error(`[HEAL_DOC_FAIL] doc=${doc.id} | ${e.message}`);
    }
    return false;
}

/**
 * markTerminal
 * Transitions an item to a failure terminal state once budget is exhausted.
 */
async function markTerminal(item, type) {
    const table = type === 'intent' ? 'upload_intents' : 'documents';
    const statusCol = type === 'intent' ? 'status' : 'submission_state';
    const statusVal = type === 'intent' ? 'FAILED_FINAL' : 'rejected'; // rejected is the nearest document failure state

    await pool.query(
        `UPDATE ${table} SET ${statusCol} = $1, terminal_type = 'FAILURE' WHERE id = $2`,
        [statusVal, item.id]
    );
}

module.exports = router;
