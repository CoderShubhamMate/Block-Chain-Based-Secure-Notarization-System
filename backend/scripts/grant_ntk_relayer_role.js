const { ethers } = require("ethers");
require("dotenv").config();
const ProviderService = require("../src/blockchain/provider-service");
const pool = require("../src/db/index");
const ConfigService = require("../src/services/config.service");
const { runWithSystemContext } = require("../src/middleware/actor");

async function main() {
    console.log("🚀 Granting RELAYER_ROLE to KMS address...");

    await pool.init();
    
    await runWithSystemContext("ADMIN_TOOL", "Granting NTK Relayer Role to KMS", async () => {
        const provider = await ProviderService.getProvider();
    const pk = process.env.BNB_SYSTEM_PRIVATE_KEY;
    if (!pk) throw new Error("BNB_SYSTEM_PRIVATE_KEY missing");

    const adminWallet = new ethers.Wallet(pk, provider);
    console.log(`- Admin Wallet: ${adminWallet.address}`);

    const config = await ConfigService.getConfig();
    const ntkAddress = config.contracts.ntk;
    console.log(`- NTK Contract: ${ntkAddress}`);

    const kmsAddress = "0x11FBDd7F0895526a6945C114e0fBaDF4Bf6159b3";
    console.log(`- KMS Target: ${kmsAddress}`);

    const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
    console.log(`- Role Hash: ${RELAYER_ROLE}`);

    const abi = [
        "function grantRole(bytes32 role, address account) external",
        "function hasRole(bytes32 role, address account) view returns (bool)"
    ];

    const ntk = new ethers.Contract(ntkAddress, abi, adminWallet);

    const alreadyHas = await ntk.hasRole(RELAYER_ROLE, kmsAddress);
    if (alreadyHas) {
        console.log("✅ KMS address already has RELAYER_ROLE.");
        return;
    }

    console.log("⏳ Sending grantRole transaction...");
    const tx = await ntk.grantRole(RELAYER_ROLE, kmsAddress);
    console.log(`- Transaction Hash: ${tx.hash}`);
    await tx.wait();
    console.log("✅ RELAYER_ROLE granted successfully!");
    });
}

main().catch(console.error);
