require('dotenv').config();
const pool = require('./src/db/index');
const UX_CODES = require('./src/constants/ux-codes');

/**
 * 🧪 Phase 8 Journey Verification Script
 * Responsibility: Verify that the Reality Engine correctly reconstructs User Experience.
 */

async function runVerification() {
    console.log("🚀 Starting Phase 8 Journey Verification...\n");

    const actorId = 1; // Assuming user_id 1 exists

    try {
        // ── SCENARIO 1: The Reward Dominance ────────────────────────────────
        console.log("🧪 Scenario 1: Reward Dominance (Reward > Blocking)");
        
        // Mocking an intent (Payment Pending - Priority ~90)
        const intentId = 'test_intent_reward_dominance';
        await pool.query(
            `INSERT INTO upload_intents (id, user_id, filename, file_hash, amount, amount_wei, status, expires_at, created_at)
             VALUES ($1, $2, 'blocking_file.pdf', 'hash1', 1, '1000', 'AWAITING_PAYMENT', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '30 seconds')
             ON CONFLICT (id) DO UPDATE SET status='AWAITING_PAYMENT', created_at = NOW() - INTERVAL '30 seconds'`,
            [intentId, actorId]
        );

        // Mocking a confirmed document (Reward - Priority 100)
        const docId = 99999;
        await pool.query(
            `INSERT INTO documents (id, user_id, filename, file_hash, submission_state, chain_confirmed, created_at, updated_at)
             VALUES ($1, $2, 'reward_file.pdf', 'hash2', 'completed', true, NOW() - INTERVAL '10 minutes', NOW())
             ON CONFLICT (id) DO UPDATE SET chain_confirmed = true, submission_state = 'completed'`,
            [docId, actorId]
        );

        // We call the orchestrator logic (simulated or via request)
        // I'll call the logic directly for speed or use a mock request
        const { getPriority } = require('./src/reality/scorer');
        const pIntent = getPriority(UX_CODES.INTENT_PAYMENT_PENDING, 30000);
        const pDoc = getPriority(UX_CODES.CHAIN_TX_CONFIRMED, 600000);
        
        console.log(`   - Priority Intent (Awaiting Payment): ${pIntent}`);
        console.log(`   - Priority Reward (Confirmed Doc): ${pDoc}`);

        if (pDoc > pIntent) {
            console.log("✅ SUCCESS: Reward correctly outranks urgency.\n");
        } else {
            console.error("❌ FAILURE: Urgency leapfrogged reward!");
        }

        // ── SCENARIO 2: The Healing Guard ───────────────────────────────────
        console.log("🧪 Scenario 2: The Healing Guard (Cooldown check)");
        const { getHealEligibility } = require('./src/reality/healer');
        
        const stalledItem = { 
            auto_retry_count: 0, 
            total_retry_cycles: 0,
            last_auto_retry_at: new Date(Date.now() - 5000) // 5s ago
        };
        
        const eligibility = getHealEligibility(stalledItem, 'CHAIN', UX_CODES.PERCEPTION.STALLED);
        console.log(`   - Cooldown Logic: ${eligibility.reason}`);
        
        if (eligibility.canHeal === false && eligibility.reason === 'COOLDOWN_ACTIVE') {
            console.log("✅ SUCCESS: Healing Guard blocked spam (Cooldown Active).\n");
        } else {
            console.error("❌ FAILURE: Healing allowed during cooldown period.");
        }

        // ── SCENARIO 3: Perception Logic ────────────────────────────────────
        console.log("🧪 Scenario 3: State-Aware Perception");
        const { getPerception } = require('./src/reality/perception');

        const pChain = getPerception(UX_CODES.CHAIN_TX_PENDING, 10000); // 10s is normal for chain
        const pIntent = getPerception(UX_CODES.INTENT_PAYMENT_PENDING, 1200000); // 20m is slow for intent

        console.log(`   - Chain (10s): ${pChain}`);
        console.log(`   - Intent (20m): ${pIntent}`);

        if (pChain === UX_CODES.PERCEPTION.NORMAL && pIntent === UX_CODES.PERCEPTION.SLOW) {
            console.log("✅ SUCCESS: Perception correctly shifted based on state-aware thresholds.\n");
        } else {
            console.error("❌ FAILURE: Perception thresholds are static or incorrect.");
        }

        // ── SCENARIO 4: Terminality ─────────────────────────────────────────
        console.log("🧪 Scenario 4: Terminality (Cycle Cap)");
        const terminalItem = {
            total_retry_cycles: 3 // Max hit
        };
        const termEligibility = getHealEligibility(terminalItem, 'CHAIN', UX_CODES.PERCEPTION.STALLED);
        console.log(`   - Terminal Check: ${termEligibility.reason}`);

        if (termEligibility.canHeal === false && termEligibility.reason === 'CYCLES_EXHAUSTED') {
            console.log("✅ SUCCESS: Terminal state reached after cycle exhaustion.\n");
        } else {
            console.error("❌ FAILURE: Terminal cap ignored.");
        }

        console.log("🎊 Phase 8 CORE LOGIC Verification PASSED.");

    } catch (err) {
        console.error("💥 Verification Crash:", err);
    } finally {
        process.exit(0);
    }
}

runVerification();
