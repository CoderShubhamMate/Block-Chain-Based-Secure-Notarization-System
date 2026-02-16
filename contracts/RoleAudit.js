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

    const ntkAddr = process.env.NTK_CONTRACT_ADDRESS;
    const ntkrAddr = process.env.NTKR_CONTRACT_ADDRESS;

    console.log(`\n🔍 Auditing Roles`);
    console.log(`Auditor (System Wallet): ${wallet.address}\n`);

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));

    async function audit(address, name) {
        console.log(`📄 Token: ${name} (${address})`);
        const data = JSON.parse(fs.readFileSync(path.join(ABI_DIR, `${name}Token.json`)));
        const abi = data.abi || data;
        const contract = new ethers.Contract(address, abi, provider);

        const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
        const hasRelayer = await contract.hasRole(RELAYER_ROLE, wallet.address);

        console.log(`   - Wallet has DEFAULT_ADMIN_ROLE: ${hasAdmin}`);
        console.log(`   - Wallet has RELAYER_ROLE:       ${hasRelayer}`);
    }

    try {
        await audit(ntkAddr, "NTK");
        await audit(ntkrAddr, "NTKR");
    } catch (err) {
        console.error("❌ Audit Failed:", err);
    }
}

main();
