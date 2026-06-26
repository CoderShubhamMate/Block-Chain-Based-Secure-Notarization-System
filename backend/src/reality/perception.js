const UX_CODES = require('../constants/ux-codes');

/**
 * 🛡️ [AUTHORITATIVE] Perception Engine
 * Responsibility: Categorizes elapsed time into UI perception levels based on state context.
 * Rule: User cares more about API speed than Blockchain finality.
 */

const THRESHOLDS = {
    // ⛓️ Blockchain Finality (Expectation: 1-2 minutes)
    [UX_CODES.CHAIN_TX_PENDING]: {
        SLOW: 45000,      // 45s
        DELAYED: 120000,  // 2m
        STALLED: 300000   // 5m
    },

    // 🤝 Notary Engagement (Expectation: 30 seconds to 1 minute)
    [UX_CODES.NOTARY_ASSIGNMENT_PENDING]: {
        SLOW: 20000,      // 20s
        DELAYED: 60000,   // 1m
        STALLED: 180000   // 3m
    },

    // 👤 User Payment (Expectation: User takes their time)
    [UX_CODES.INTENT_PAYMENT_PENDING]: {
        SLOW: 300000,     // 5m
        DELAYED: 900000,  // 15m
        STALLED: 1500000  // 25m
    },
};

function getPerception(uxCode, elapsed_ms) {
    const limits = THRESHOLDS[uxCode];
    if (!limits) return UX_CODES.PERCEPTION.NORMAL;

    if (elapsed_ms > limits.STALLED) return UX_CODES.PERCEPTION.STALLED;
    if (elapsed_ms > limits.DELAYED) return UX_CODES.PERCEPTION.DELAYED;
    if (elapsed_ms > limits.SLOW)    return UX_CODES.PERCEPTION.SLOW;
    
    return UX_CODES.PERCEPTION.NORMAL;
}

module.exports = { getPerception };
