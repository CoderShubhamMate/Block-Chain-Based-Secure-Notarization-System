/**
 * BBSNS Infrastructure Identity Protocol Configuration (v1)
 * Single Source of Truth for Deterministic Signing Challenges
 */

const SCHEMA_CONFIG = {
    v1: {
        requiresPayloadHash: {
            REGISTER: true,
            LOGIN: false,
            NOTARY_BIND: false,
            NOTARY_ONBOARD: false,
            GENESIS_ONBOARD: false
        },
        normalization: {
            email:      (v) => (v || "").trim().toLowerCase(),
            nationalId: (v) => (v || "").toString().replace(/\s+/g, '').toUpperCase(),
            fullName:   (v) => (v || "").trim()
        }
    }
    // Future v2 schemas will be added here to prevent logic drift
};

const IDENTITY_PROTOCOL = {
    DOMAIN: 'BBSNS',
    DEFAULT_VERSION: 'v1',
    PURPOSES: {
        LOGIN: 'LOGIN',
        REGISTER: 'REGISTER',
        NOTARY_BIND: 'NOTARY_BIND',
        NOTARY_ONBOARD: 'NOTARY_ONBOARD'
    }
};

/**
 * buildSigningMessage: Deterministic template construction
 * Format: DOMAIN::PURPOSE::VERSION::NONCE::WALLET[::PAYLOAD_HASH]
 */
function buildSigningMessage(purpose, nonce, wallet, payloadHash = null, version = null) {
    if (!purpose || !nonce || !wallet) {
        throw new Error("Protocol violation: purpose, nonce, and wallet are mandatory for challenge construction.");
    }
    
    // 🛡️ [Hardening] Metadata Normalization
    const normalizedPurpose = purpose.toUpperCase();
    const normalizedWalletAddress = wallet.toLowerCase();
    const activeVersion = version || IDENTITY_PROTOCOL.DEFAULT_VERSION;
    
    let base = `${IDENTITY_PROTOCOL.DOMAIN}::${normalizedPurpose}::${activeVersion}::${nonce}::${normalizedWalletAddress}`;
    
    if (payloadHash) {
        base += `::${payloadHash}`;
    }
    
    return base;
}

module.exports = {
    IDENTITY_PROTOCOL,
    SCHEMA_CONFIG,
    buildSigningMessage
};
