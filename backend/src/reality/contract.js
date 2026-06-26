const UX_CODES = require('../constants/ux-codes');

/**
 * 🛡️ [AUTHORITATIVE] Reality Contract
 * Responsibility: Maps composed state data into the final UX response schema.
 * Rule: NO file should know everything. This only knows how to shape the response.
 */

function composeReality(data, options = {}) {
    const { 
        type, 
        state, 
        uxCode, 
        perception, 
        priority, 
        elapsed_ms, 
        flow_id,
        is_blocking = false,
        can_dismiss = true,
        retry_allowed = false,
        retry_after = null,
        details = {}
    } = data;

    // 🛡️ [PHASE_8.5] Confidence Scorer
    let confidence = 'HIGH';
    if (perception === UX_CODES.PERCEPTION.SLOW) confidence = 'MEDIUM';
    if (perception === UX_CODES.PERCEPTION.DELAYED) confidence = 'MEDIUM';
    if (perception === UX_CODES.PERCEPTION.STALLED) confidence = 'LOW';

    // 🛡️ [PHASE_8.5] Flow Step Identification
    let flow_step = 'VERIFY'; // Default
    if (uxCode === UX_CODES.INTENT_PAYMENT_PENDING) flow_step = 'PAYMENT';
    if (uxCode === UX_CODES.INTENT_CREATED) flow_step = 'UPLOAD';
    if (uxCode === UX_CODES.CHAIN_TX_CONFIRMED) flow_step = 'COMPLETE';
    if (uxCode === UX_CODES.NOTARY_ASSIGNMENT_PENDING) flow_step = 'ASSIGN';

    // Determine Authoritative Action based on UX Code + Perception
    let action = UX_CODES.ACTIONS.WAIT;
    if (uxCode === UX_CODES.INTENT_PAYMENT_PENDING) action = UX_CODES.ACTIONS.SIGN_PAYMENT;
    if (perception === UX_CODES.PERCEPTION.STALLED && retry_allowed) action = UX_CODES.ACTIONS.RETRY_VERIFICATION;
    if (perception === UX_CODES.PERCEPTION.TERMINAL) action = UX_CODES.ACTIONS.CONTACT_SUPPORT;

    return {
        flow_id,         // UI Anchor
        type,            // DOCUMENT_NOTARIZATION | IDENTITY_SYNC | etc.
        state,           // Raw Backend State
        code: uxCode,    // UX Identity Contract Code
        perception,      // NORMAL | SLOW | DELAYED | STALLED | TERMINAL
        action,          // Authoritative next step for user
        priority,        // Category + Dynamic Score
        confidence,      // 🛡️ [PHASE_8.5] HIGH | MEDIUM | LOW
        flow_step,       // 🛡️ [PHASE_8.5] UPLOAD | PAYMENT | VERIFY | ASSIGN | COMPLETE
        is_blocking,     // Should show modal?
        can_dismiss,     // Can user ignore?
        retry_allowed,   // Is manual retry available?
        retry_after,     // Seconds until next allowed retry
        elapsed_ms,      // Transparency metric
        details          // State-specific metadata (amount, tx_hash, etc.)
    };
}

function generateMetadata(consistency = 'STRONG') {
    return {
        snapshot_version: '1.0.0',
        generated_at: new Date().toISOString(),
        consistency
    };
}

module.exports = { composeReality, generateMetadata };
