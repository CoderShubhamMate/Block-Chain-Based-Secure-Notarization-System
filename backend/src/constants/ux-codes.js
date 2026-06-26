/**
 * 🛡️ [AUTHORITATIVE] UX State Identity Contract
 * Responsibility: Defines the mapping from backend raw states to human-friendly UI codes.
 * This ensures the Frontend (Desktop/Web) can ownthe presentation logic without
 * backend redeploys.
 */

const UX_CODES = {
    // Identity & Handshake
    AUTH_CHALLENGE_ISSUED: 'AUTH_CHALLENGE_ISSUED',
    NONCE_COOLDOWN: 'NONCE_COOLDOWN',
    AUTH_FAILED: 'AUTH_FAILED',

    // Document & Intent Lifecycle
    INTENT_CREATED: 'INTENT_CREATED',
    INTENT_PAYMENT_PENDING: 'INTENT_PAYMENT_PENDING',
    INTENT_PAYMENT_VERIFIED: 'INTENT_PAYMENT_VERIFIED',
    INTENT_DOC_SYNC_PENDING: 'INTENT_DOC_SYNC_PENDING',
    
    // Blockchain & Finality
    CHAIN_TX_PENDING: 'CHAIN_TX_PENDING',
    CHAIN_TX_CONFIRMED: 'CHAIN_TX_CONFIRMED',
    CHAIN_SYNC_DELAYED: 'CHAIN_SYNC_DELAYED', // For elapsed_ms > threshold
    
    // Notary Engagement
    NOTARY_ASSIGNMENT_PENDING: 'NOTARY_ASSIGNMENT_PENDING',
    NOTARY_REQUESTED: 'NOTARY_REQUESTED',
    NOTARY_REJECTED: 'NOTARY_REJECTED',
    NOTARY_APPROVED: 'NOTARY_APPROVED',

    // System Status
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    RATE_LIMITED: 'RATE_LIMITED',

    // 🛡️ [PHASE_8] Perception Levels
    PERCEPTION: {
        NORMAL: 'NORMAL',
        SLOW: 'SLOW',
        DELAYED: 'DELAYED',
        STALLED: 'STALLED',
        TERMINAL: 'TERMINAL'
    },

    // 🛡️ [PHASE_8] User Actions
    ACTIONS: {
        WAIT: 'WAIT',
        SIGN_PAYMENT: 'SIGN_PAYMENT',
        RETRY_VERIFICATION: 'RETRY_VERIFICATION',
        CONTACT_SUPPORT: 'CONTACT_SUPPORT',
        RE_INITIATE: 'RE_INITIATE',
        NONE: 'NONE'
    },

    // 🛡️ [PHASE_8] Terminal Classifications
    TERMINAL_TYPES: {
        SUCCESS: 'SUCCESS',
        FAILURE: 'FAILURE',
        ABANDONED: 'ABANDONED'
    }
};

module.exports = UX_CODES;
