const { ethers } = require("ethers");

async function main() {
    // --- CONFIGURATION ---
    const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const KMS_SIGNER_ADDRESS = "0x11FBDd7F0895526a6945C114e0fBaDF4Bf6159b3";
    const AMOUNT_BNB = "0.1"; // Enough for many days of gas
    
    // ⚠️ PRIVATE KEY REDACTED
    const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';
    // ---------------------

    console.log("🚀 Fueling up the KMS Signer...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);
    
    console.log(`- From Master Admin: ${wallet.address}`);
    console.log(`- To KMS Signer: ${KMS_SIGNER_ADDRESS}`);

    try {
        console.log(`⏳ Sending ${AMOUNT_BNB} BNB for gas...`);
        const tx = await wallet.sendTransaction({
            to: KMS_SIGNER_ADDRESS,
            value: ethers.parseEther(AMOUNT_BNB)
        });
        
        console.log(`✅ Gas Sent! Hash: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        await tx.wait();
        console.log("🎉 SUCCESS! KMS Signer is now fueled.");
        console.log("The ntk-worker will now be able to process the distribution.");
    } catch (err) {
        console.error("❌ FAILED:", err.message);
    }
}

main().catch(console.error);
