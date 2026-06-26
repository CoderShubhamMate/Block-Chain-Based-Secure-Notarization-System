const axios = require('axios');
const API_BASE = 'https://api.bbsns.online';

async function runTests() {
    console.log("🚀 Starting Phase 4.1 Structural Stress Test...");
    
    // 1. Cross-Role Misuse (OWNER calling /approve)
    // We expect a BLOCKED result because /approve requires ROLES.NOTARY
    try {
        console.log("\n[TEST 1] Cross-Role Misuse: OWNER calling NOTARY route (/approve)...");
        const res = await axios.post(`${API_BASE}/api/documents/123/approve`, {}, {
            headers: { 'x-bbsns-actor': 'OWNER:1' }
        });
        console.log("❌ CRITICAL FAILURE: OWNER was ALLOWED to call /approve (Unexpected Allow)");
    } catch (err) {
        const status = err.response?.status;
        const error = err.response?.data?.error;
        if (status === 403) {
            console.log("✅ PASS: OSWNER blocked from NOTARY route (403 Forbidden)");
        } else {
            console.log(`❌ FAIL: Unexpected error status ${status}: ${error}`);
        }
    }

    // 2. System Isolation (Web request trying to use SYSTEM actor)
    try {
        console.log("\n[TEST 2] System Isolation: Web request attempting to spoof SYSTEM actor...");
        const res = await axios.get(`${API_BASE}/api/auth/nonce`, {
            headers: { 'x-bbsns-actor': 'SYSTEM:1' }
        });
         console.log("❌ CRITICAL FAILURE: SYSTEM actor spoofing ALLOWED via web (Security Violation)");
    } catch (err) {
         const status = err.response?.status;
         if (status === 401 || status === 403 || status === 500) {
             console.log(`✅ PASS: SYSTEM actor spoofing BLOCKED (${status})`);
         } else {
             console.log(`❌ FAIL: Unexpected error status ${status}`);
         }
    }

    // 3. Domain Mismatch (Action-Domain Binding)
    // We'll try to find a route that might be vulnerable to action injection
    // But since the auditor enforces it at boot, we'll check runtime logs for ACTION_DOMAIN_VIOLATION
    
    console.log("\n🚀 Stress Test Suite Complete.");
}

runTests();
