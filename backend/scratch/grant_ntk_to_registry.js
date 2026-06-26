
require('dotenv').config();
const { ethers } = require('ethers');

async function run() {
    const NTK_TOKEN = '0x0d92A3De88202C929714df9cB24395CF4C15ba2e';
    const DOC_REGISTRY = '0x8fdaCefB6002F56A59cef36dA94e2ee9d55D7fe6';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;
    
    // Testnet RPC
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
    const signer = new ethers.Wallet(PK, provider);
    
    const RELAYER_ROLE = ethers.id("RELAYER_ROLE");
    
    const ntk = new ethers.Contract(NTK_TOKEN, [
        "function grantRole(bytes32 role, address account) external",
        "function hasRole(bytes32 role, address account) view returns (bool)"
    ], signer);

    console.log(`Granting RELAYER_ROLE to DocumentRegistry (${DOC_REGISTRY})...`);
    
    try {
        const tx = await ntk.grantRole(RELAYER_ROLE, DOC_REGISTRY);
        console.log(`Transaction broadcast: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Role granted to DocumentRegistry.`);

        const hasRole = await ntk.hasRole(RELAYER_ROLE, DOC_REGISTRY);
        console.log(`Final check: Does DocRegistry have RELAYER_ROLE? ${hasRole}`);
    } catch (err) {
        console.error("Failed to grant role:", err.message);
        if (err.message.includes("missing role")) {
            console.log("Admin wallet does not have permission to grant roles directly. This might need MultiSig if the ownership is transferred.");
        }
    }
}

run().catch(console.error);
