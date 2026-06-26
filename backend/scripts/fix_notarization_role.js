const { ethers } = require("ethers");
require("dotenv").config({ path: "./Backend/.env" });

async function main() {
    console.log("🚀 Granting RELAYER_ROLE to DocumentRegistry contract (HARDCODED VERSION)...");

    const provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL);
    const pk = process.env.BNB_SYSTEM_PRIVATE_KEY;
    if (!pk) throw new Error("BNB_SYSTEM_PRIVATE_KEY missing");

    const adminWallet = new ethers.Wallet(pk, provider);
    console.log(`- Admin Wallet: ${adminWallet.address}`);

    // Verified addresses from Backend/.env
    const ntkAddress = "0x981cE4Ef97B3A45f7ae02da8d2C228F9ae5B95aF";
    const docRegistryAddress = "0x45F31eC24b8892D09bd85b655dBf609a984Fa03C";

    console.log(`- NTK Contract: ${ntkAddress}`);
    console.log(`- DocumentRegistry Target: ${docRegistryAddress}`);

    const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
    console.log(`- Role Hash: ${RELAYER_ROLE}`);

    const abi = [
        "function grantRole(bytes32 role, address account) external",
        "function hasRole(bytes32 role, address account) view returns (bool)"
    ];

    const ntk = new ethers.Contract(ntkAddress, abi, adminWallet);

    console.log("⏳ Checking current role status...");
    try {
        const alreadyHas = await ntk.hasRole(RELAYER_ROLE, docRegistryAddress);
        if (alreadyHas) {
            console.log("✅ DocumentRegistry already has RELAYER_ROLE.");
            return;
        }
    } catch (e) {
        console.error("❌ Failed to check role (contract might be different):", e.message);
        // Continue anyway if it's just a call failure
    }

    console.log("⏳ Sending grantRole transaction...");
    const tx = await ntk.grantRole(RELAYER_ROLE, docRegistryAddress);
    console.log(`- Transaction Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    await tx.wait();
    console.log("✅ RELAYER_ROLE granted successfully to DocumentRegistry!");
}

main().catch(console.error);
