const { ethers } = require("ethers");
require("dotenv").config();
const ProviderService = require("../src/blockchain/provider-service");
const pool = require("../src/db/index");
const ConfigService = require("../src/services/config.service");
const { runWithSystemContext } = require("../src/middleware/actor");

async function main() {
    console.log("🔍 Auditing NTK Contract Roles...");

    await pool.init();
    
    await runWithSystemContext("ADMIN_TOOL", "Auditing NTK Roles", async () => {
        const provider = await ProviderService.getProvider();
    const config = await ConfigService.getConfig();
    const ntkAddress = config.contracts.ntk;
    console.log(`- NTK Contract: ${ntkAddress}`);

    const abi = [
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function getRoleAdmin(bytes32 role) view returns (bytes32)"
    ];

    const ntk = new ethers.Contract(ntkAddress, abi, provider);

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));

    const adminOfAdmin = await ntk.getRoleAdmin(DEFAULT_ADMIN_ROLE);
    const adminOfRelayer = await ntk.getRoleAdmin(RELAYER_ROLE);
    console.log(`- Admin of DEFAULT_ADMIN_ROLE: ${adminOfAdmin}`);
    console.log(`- Admin of RELAYER_ROLE: ${adminOfRelayer}`);

    const addresses = [
        "0x2f5b7e4A1ED7966ba4E0100a126D8125654cEFE6", // Plaintext Key (Deployer?)
        "0x11FBDd7F0895526a6945C114e0fBaDF4Bf6159b3", // KMS Address
        "0xB5392E306007eddE9015a8c5b0AF533E8067bC18", // MultiSig
        "0x91eD53552cA83709a06d5763315E09f5FC6cdD30", // Target Genesis Wallet
        "0x0DD325C87CDF2B00ef6cE9de537AFD4826c98f3c", // NotaryRegistry
        "0x8cD99b69E0192C2803eC178E859d671F015A83b3", // GenesisActivation
        "0xc0924c217fE5A78C5A4c8F8edE402025E549e31f"  // SimpleDeploy MultiSig
    ];

    for (const addr of addresses) {
        const isAdmin = await ntk.hasRole(DEFAULT_ADMIN_ROLE, addr);
        const isRelayer = await ntk.hasRole(RELAYER_ROLE, addr);
        console.log(`Address: ${addr}`);
        console.log(` - Admin: ${isAdmin}`);
        console.log(` - Relayer: ${isRelayer}`);
    }
    });
}

main().catch(console.error);
