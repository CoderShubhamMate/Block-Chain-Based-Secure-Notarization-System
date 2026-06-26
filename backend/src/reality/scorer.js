const UX_CODES = require('../constants/ux-codes');

/**
 * 🛡️ [AUTHORITATIVE] Priority Scorer
 * Responsibility: Assigns urgency scores to states to determine "Primary Reality".
 * Logic: final_priority = category_priority + dynamic_score.
 * Rule: REWARD (100) must ALWAYS beat ACTION_REQUIRED (80).
 */

const CATEGORY_SCORES = {
    // 🏆 REWARD (User Success / Completion)
    [UX_CODES.CHAIN_TX_CONFIRMED]: 100,
    [UX_CODES.NOTARY_APPROVED]: 100,

    // 🧨 CRITICAL (System Failures / Rejections)
    [UX_CODES.AUTH_FAILED]: 90,
    [UX_CODES.NOTARY_REJECTED]: 90,
    [UX_CODES.PERCEPTION.TERMINAL]: 95, // Terminal failure is very high priority for visibility

    // ⚠️ ACTION_REQUIRED (User must do something)
    [UX_CODES.INTENT_PAYMENT_PENDING]: 80,
    [UX_CODES.AUTH_CHALLENGE_ISSUED]: 80,

    // ⚙️ BACKGROUND (System is working)
    [UX_CODES.INTENT_PAYMENT_VERIFIED]: 50,
    [UX_CODES.CHAIN_TX_PENDING]: 52,
    [UX_CODES.NOTARY_ASSIGNMENT_PENDING]: 45,
    [UX_CODES.INTENT_DOC_SYNC_PENDING]: 48
};

function getPriority(uxCode, elapsed_ms) {
    const base = CATEGORY_SCORES[uxCode] || 0;
    
    // Dynamic Score (Urgency): Scales 0 to 10 based on age for non-reward items
    let dynamic = 0;
    if (base < 100 && base > 0) {
        // Linear increase over 5 minutes, capped at 10
        dynamic = Math.min(10, (elapsed_ms / 300000) * 10);
    }

    return base + dynamic;
}

module.exports = { getPriority };
