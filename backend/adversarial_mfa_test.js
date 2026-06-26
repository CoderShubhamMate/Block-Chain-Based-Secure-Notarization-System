
const { ethers } = require('ethers');
const axios = require('axios');

const API_BASE = 'https://bbsns.online/api';

async function runAdversarialTest() {
  console.log("🛡️ Starting Adversarial Verification: MFA Bypass Attempt...");
  
  const wallet = ethers.Wallet.createRandom();
  const nationalId = "ABC123456";
  const wrongNationalId = "XYZZY999";
  const email = `adversarial_${Date.now()}@bbsns.test`;

  try {
    // 1. Register with correct data
    console.log("[STEP 1] Registering legitimate account...");
    const nonceRes = await axios.post(`${API_BASE}/auth/nonce`, {
      wallet_address: wallet.address,
      purpose: 'REGISTER',
      payload: { fullName: "Adversarial Test", email, nationalIdText: nationalId },
      version: 'v1'
    });
    const sig = await wallet.signMessage(nonceRes.data.message_template);
    await axios.post(`${API_BASE}/users/register`, {
      fullName: "Adversarial Test", email, password: "Password123!", 
      nationalIdText: nationalId, walletAddress: wallet.address, signature: sig, nonce: nonceRes.data.nonce
    });
    console.log("✅ Legitimate account created.");

    // 2. Attempt login with WRONG National ID
    console.log(`\n[STEP 2] Attempting login with WRONG National ID: "${wrongNationalId}"...`);
    const lNonceRes = await axios.post(`${API_BASE}/auth/nonce`, { wallet_address: wallet.address, purpose: 'LOGIN' });
    const lSig = await wallet.signMessage(lNonceRes.data.message_template);

    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email, password: "Password123!", nationalId: wrongNationalId,
        nonce: lNonceRes.data.nonce, signature: lSig, walletAddress: wallet.address
      });
      console.error("❌ CRITICAL FAILURE: Login bypassed the National ID check!");
      process.exit(1);
    } catch (loginErr) {
      if (loginErr.response && loginErr.response.status === 401 && loginErr.response.data.error === 'National ID mismatch') {
        console.log("✅ [PASS] Adversarial attempt BLOCKED. Error: National ID mismatch.");
      } else {
        console.error("❓ UNEXPECTED ERROR:", loginErr.response?.data || loginErr.message);
        process.exit(1);
      }
    }

    console.log("\n✨ ADVERSARIAL TEST COMPLETED: MFA Claim is verified.");
    process.exit(0);
  } catch (err) {
    console.error("💥 TEST RUN CRASHED:", err.response?.data || err.message);
    process.exit(1);
  }
}

runAdversarialTest();
