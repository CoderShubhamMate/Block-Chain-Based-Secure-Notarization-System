const { ethers } = require("ethers");

async function main() {
    // --- CONFIGURATION ---
    const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const NTK_ADDRESS = "0x981cE4Ef97B3A45f7ae02da8d2C228F9ae5B95aF";
    const KMS_SIGNER_ADDRESS = "0x11FBDd7F0895526a6945C114e0fBaDF4Bf6159b3";
    const RELAYER_ROLE = ethers.id("RELAYER_ROLE");
    // ⚠️ PRIVATE KEY REDACTED
    const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';
    // ---------------------

    console.log("🚀 Starting on-chain authorization...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
    console.log(`- Using Wallet: ${wallet.address}`);

    const abi = ["function grantRole(bytes32 role, address account) external"];
    const ntk = new ethers.Contract(NTK_ADDRESS, abi, wallet);

    try {
        console.log("⏳ Sending transaction to authorize KMS signer...");
        const tx = await ntk.grantRole(RELAYER_ROLE, KMS_SIGNER_ADDRESS);
        console.log(`✅ Transaction Sent! Hash: ${tx.hash}`);
        console.log("⏳ Waiting for blockchain confirmation...");
        await tx.wait();
        console.log("🎉 SUCCESS! KMS Signer is now authorized.");
        console.log("The ntk-worker on your server will now start the distribution automatically.");
    } catch (err) {
        console.error("❌ FAILED:", err.message);
    }
}

main().catch(console.error);
