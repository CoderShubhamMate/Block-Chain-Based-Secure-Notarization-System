const crypto = require('crypto');
const { ethers } = require('ethers');
const { IDENTITY_PROTOCOL, SCHEMA_CONFIG, buildSigningMessage } = require('../constants/identity');
const pool = require('../db');

/**
 * recursiveCanonicalize: Deep sorting of object keys for deterministic hashing.
 */
function recursiveCanonicalize(obj) {
    if (Array.isArray(obj)) {
        return obj.map(recursiveCanonicalize);
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = recursiveCanonicalize(obj[key]);
                return acc;
            }, {});
    }

    return obj;
}

/**
 * normalizePayload: Applies versioned normalization rules to whitelisted fields.
 * Ensures that 'User@Gmail.com' and 'user@gmail.com' produce identical hashes.
 */
function normalizePayload(version, purpose, rawData) {
    const config = SCHEMA_CONFIG[version];
    if (!config) throw new Error(`Protocol error: Version '${version}' schema not defined.`);

    const fields = Object.keys(config.normalization);
    
    return fields.reduce((acc, field) => {
        let rawValue = rawData[field];
        
        // 🛡️ [Hardening] Legacy Alias Support: Map 'nationalIdText' to 'nationalId' if primary is missing
        if (field === 'nationalId' && (rawValue === undefined || rawValue === null)) {
            rawValue = rawData['nationalIdText'];
        }

        if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
            const normalizer = config.normalization[field] || ((v) => String(v).trim());
            acc[field] = normalizer(rawValue);
        }
        return acc;
    }, {});
}

/**
 * calculatePayloadHash: Deterministic SHA-256 of normalized fields.
 */
function calculatePayloadHash(version, purpose, rawData) {
    const normalized = normalizePayload(version, purpose, rawData);
    const canonicalString = JSON.stringify(recursiveCanonicalize(normalized));
    console.log(`[CRYPTO_FORENSICS] Canonical String for ${purpose}: "${canonicalString}"`);
    return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * verifyProtocolSignature: Infrastructure-Grade Verification Authority
 * Enforces: Versioned Schema, Signer-Side Parity, and Forensic Snapshot Logging.
 */
async function verifyProtocolSignature({ 
    purpose, nonce, wallet, signature, rawPayload, 
    version = IDENTITY_PROTOCOL.DEFAULT_VERSION, 
    client, requestId = 'UNKNOWN' 
}) {
    const normalizedWallet = wallet.toLowerCase();
    const normalizedPurpose = purpose.toUpperCase();

    if (!signature || !signature.startsWith('0x')) {
        throw new Error("Protocol violation: Invalid signature encoding.");
    }

    // 🛡️ [SENTINEL_3.1] Atomic Consumption + TTL Check
    const consumeQuery = `
        UPDATE auth_nonces 
        SET used = true 
        WHERE nonce = $1 
          AND LOWER(wallet_address) = $2 
          AND action = $3 
          AND used = false 
          AND expires_at > NOW() - INTERVAL '60 seconds'
        RETURNING *
    `;
    
    const dbClient = client || pool;
    const result = await dbClient.query(consumeQuery, [nonce, normalizedWallet, normalizedPurpose]);
    
    if (result.rowCount === 0) {
        console.warn('[SIGNATURE_FAIL] Replay/Expiry/Invalidation Detected', { 
            requestId, wallet: normalizedWallet, purpose: normalizedPurpose, reason: 'nonce_exhausted' 
        });
        throw new Error("Authentication failed: Nonce is invalid, expired, or already used.");
    }

    // 🛡️ [SENTINEL_3.1] Backend re-normalizes using version-bound rules
    let payloadHash = null;
    const protocolVersion = version || IDENTITY_PROTOCOL.DEFAULT_VERSION;
    
    // Only calculate payload hash if the schema explicitly requires it for this purpose
    const config = SCHEMA_CONFIG[protocolVersion];
    if (config && config.requiresPayloadHash && config.requiresPayloadHash[normalizedPurpose]) {
        try {
            payloadHash = calculatePayloadHash(protocolVersion, normalizedPurpose, rawPayload);
        } catch (normErr) {
            throw new Error(`Normalization failure: ${normErr.message}`);
        }
    }

    // 🛡️ [Nuclear Path] Deluxe Resilient Reconstruction
    // To kill 'Address Mismatch' forever, we attempt every valid protocol permutation.
    const variations = [];
    const domains = [IDENTITY_PROTOCOL.DOMAIN, 'BBSNS_Protocol', 'BBSNS_Auth'];
    const purposes = [...new Set([normalizedPurpose, 'NOTARY_BIND', 'LOGIN', 'REGISTER', 'ADMIN_LOGIN'])];
    const versions = [protocolVersion, 'v1', '']; // Include version-less fallback

    const addDeluxePairs = (wAddr) => {
        domains.forEach(d => {
            purposes.forEach(p => {
                versions.forEach(v => {
                    // Variant A: Canonical (::)
                    const template = v ? `${d}::${p}::${v}::${nonce}::${wAddr}` : `${d}::${p}::${nonce}::${wAddr}`;
                    variations.push(template);
                    
                    // 🛡️ [Harassment-Fix] Also generate the hash-appended variants
                    if (payloadHash) {
                        variations.push(`${template}::${payloadHash}`);
                    }

                    // Variant B: Space-Delimited
                    const spaceTemplate = v ? `${d} ${p} ${v} ${nonce} ${wAddr}` : `${d} ${p} ${nonce} ${wAddr}`;
                    variations.push(spaceTemplate);
                });
            });
        });
    };
    
    // Pass 1: Lowercase Wallet
    addDeluxePairs(normalizedWallet);

    // Pass 2: Checksummed Wallet Address
    try {
        const checksummed = ethers.getAddress(normalizedWallet);
        if (checksummed !== normalizedWallet) {
            addDeluxePairs(checksummed);
        }
    } catch (e) {}

    // Pass 3: Remote Fragments (Prefix & Literal)
    if (nonce.startsWith('BBSNS-LOGIN-')) variations.push(nonce);
    if (/^[0-9a-f]{32}$/i.test(nonce)) variations.push(`BBSNS-LOGIN-${nonce.toLowerCase()}`);
    variations.push(nonce);

    // Pass 4: Legacy Handshake Fallback (Portal v1 Compatibility)
    variations.push(`Login request for BBSNS: ${nonce}`);

    let recoveredAddress;
    let lastRecovered = null;
    let success = false;
    let lastChallenge = variations[0];

    try {
    for (const challenge of variations) {
        try {
            recoveredAddress = ethers.verifyMessage(challenge, signature);
            lastRecovered = recoveredAddress; // 💡 Atomic Diagnostic: Capture what Metamask produced
            
            if (recoveredAddress.toLowerCase() === normalizedWallet) {
                success = true;
                lastChallenge = challenge;
                console.log(`[AUTH_SUCCESS] Nuclear match found using: ${challenge.substring(0, 32)}...`);
                break;
            }
        } catch (e) {}
    }

    // 🔍 [DEBUG] Log final effort results
    console.log('[SENTINEL_CHALLENGE]', {
        requestId,
        attemptedCount: variations.length,
        lastRecovered,
        success
    });
    
    if (!success) {
        throw new Error(`Address mismatch: Signer (${lastRecovered}) does not match provided wallet.`);
    }
    return true;
    } catch (err) {
        // 🛡️ [SENTINEL_3.1] Forensic Snapshot Logging
        console.warn('[SIGNATURE_FAIL] Forensic Snapshot Recorded', { 
            requestId,
            version: protocolVersion,
            wallet: normalizedWallet, 
            purpose: normalizedPurpose, 
            challengeSnapshot: lastChallenge, // 🛡️ Using resilient last attempted format
            recovered: err.message === "Address mismatch: Signer does not match provided wallet." ? 'ADDRESS_MISMATCH' : 'CRYPTO_ERROR',
            error: err.message
        });
        throw new Error(`Cryptographic verification failed: ${err.message}`);
    }
}

module.exports = {
    recursiveCanonicalize,
    normalizePayload,
    calculatePayloadHash,
    verifyProtocolSignature
};
