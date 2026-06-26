const RECOVERY_POLICY = require('../constants/recovery-policy');
const UX_CODES = require('../constants/ux-codes');

/**
 * 🛡️ [AUTHORITATIVE] Healer Engine
 * Responsibility: Decides if an item is eligible for "Aggressive Healing" (Auto-Retry).
 * Rule: healing_cooldown_ms (30s-60s) prevents RPC/DB spam.
 */

// 🛡️ [PHASE_8.5] Global Healing Guard (Memory-based for simplicity in single-node)
let GLOBAL_HEAL_COUNT = 0;
let LAST_BUCKET_RESET = Date.now();
const GLOBAL_HEAL_LIMIT = 50; // 50 heals per 10s
const BUCKET_WINDOW_MS = 10000;

function checkGlobalHealLimit() {
    const now = Date.now();
    if (now - LAST_BUCKET_RESET > BUCKET_WINDOW_MS) {
        GLOBAL_HEAL_COUNT = 0;
        LAST_BUCKET_RESET = now;
    }
    return GLOBAL_HEAL_COUNT < GLOBAL_HEAL_LIMIT;
}

function incrementGlobalHeal() {
    GLOBAL_HEAL_COUNT++;
}

function getHealEligibility(item, policyKey, perception) {
    const policy = RECOVERY_POLICY[policyKey];
    if (!policy || policy.MAX_RETRIES === 0) {
        return { canHeal: false, reason: 'NO_POLICY' };
    }

    // 🛡️ [PHASE_8.5] Global Rate Limit Check
    if (!checkGlobalHealLimit()) {
        return { canHeal: false, reason: 'GLOBAL_RATE_LIMIT' };
    }

    const now = new Date();
    const lastRetry = item.last_auto_retry_at ? new Date(item.last_auto_retry_at) : null;
    const windowResetAt = item.retry_window_reset_at ? new Date(item.retry_window_reset_at) : null;
    
    // 1. Terminal Cycle Check (Total Lifetime Budget)
    if (item.total_retry_cycles >= policy.MAX_CYCLES) {
        return { canHeal: false, reason: 'CYCLES_EXHAUSTED', terminal: true };
    }

    // 2. Window Reset Logic (Bypass current retries if time has passed)
    if (windowResetAt && now > windowResetAt) {
        return { 
            canHeal: true, 
            reason: 'WINDOW_RESET', 
            resetNeeded: true 
        };
    }

    // 3. Current Retry Budget Check
    if (item.auto_retry_count >= policy.MAX_RETRIES) {
        return { canHeal: false, reason: 'RETRIES_EXHAUSTED' };
    }

    // 4. Cooldown Guard (30-60s)
    if (lastRetry && (now - lastRetry) < policy.COOLDOWN_MS) {
        return { canHeal: false, reason: 'COOLDOWN_ACTIVE' };
    }

    // 5. Perception Guard (Only heal if STALLED)
    if (perception !== UX_CODES.PERCEPTION.STALLED) {
        return { canHeal: false, reason: 'NOT_STALLED' };
    }

    return { canHeal: true, reason: 'ELIGIBLE' };
}

module.exports = { getHealEligibility, incrementGlobalHeal };
