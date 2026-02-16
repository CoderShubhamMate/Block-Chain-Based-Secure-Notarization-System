import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const ABI_DIR = path.join(__dirname, "abi");

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.BNB_SYSTEM_PRIVATE_KEY, provider);

    const multiSigAddr = process.env.MULTISIG_CONTRACT_ADDRESS;
    const ntkAddr = process.env.NTK_CONTRACT_ADDRESS;
    const ntkrAddr = process.env.NTKR_CONTRACT_ADDRESS;

    console.log(`\n🛡️ Starting Final Role Handover`);
    console.log(`MultiSig: ${multiSigAddr}`);
    console.log(`Current Admin: ${wallet.address}\n`);

    if (!multiSigAddr) throw new Error("MultiSig address not in .env");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    async function secureToken(address, name) {
        console.log(`🔒 Securing ${name} (${address})...`);
        const data = JSON.parse(fs.readFileSync(path.join(ABI_DIR, `${name}Token.json`)));
        const abi = data.abi || data; // Handle both full artifacts and raw ABIs
        const contract = new ethers.Contract(address, abi, wallet);

        // 1. Grant Admin to MultiSig
        console.log(`   - Granting DEFAULT_ADMIN_ROLE to MultiSig...`);
        const grantTx = await contract.grantRole(DEFAULT_ADMIN_ROLE, multiSigAddr);
        await grantTx.wait();

        // 2. Revoke Admin from Self
        console.log(`   - Revoking DEFAULT_ADMIN_ROLE from self...`);
        const revokeTx = await contract.revokeRole(DEFAULT_ADMIN_ROLE, wallet.address);
        await revokeTx.wait();

        console.log(`✅ ${name} Secured.`);
    }

    try {
        await secureToken(ntkAddr, "NTK");
        await secureToken(ntkrAddr, "NTKR");

        console.log(`\n🎉 ALL OPERATIONAL AUTHORITY TRANSFERRED TO MULTI-SIG!`);
        console.log(`The Relayer is now a ZERO-PRIVILEGE coordinating service.`);

    } catch (err) {
        console.error("❌ Role Transfer Failed:", err);
    }
}

main();
