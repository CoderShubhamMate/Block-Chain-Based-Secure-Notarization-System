import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const ABI_DIR = path.join(__dirname, "abi");
const ENV_PATH = path.join(__dirname, "../backend/.env");
const FRONTEND_ENV_PATH = path.join(__dirname, "../Web-App/.env.local");

const GENESIS_ADMIN_WALLET = "0x91eD53552cA83709a06d5763315E09f5FC6cdD30";

/**
 * Automates the TRUE Genesis Bootstrap Deployment.
 */
async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.BNB_SYSTEM_PRIVATE_KEY, provider);

    console.log(`\n🚀 Starting TRUE Genesis Bootstrap Deployment`);
    console.log(`👤 Deployer: ${wallet.address}\n`);

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    async function deploy(name, fileName, ...args) {
        const artifactPath = path.join(__dirname, `artifacts/contracts/${fileName}.sol/${name}.json`);
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

        console.log(`📦 Deploying ${name}...`);
        const contract = await factory.deploy(...args);
        await contract.waitForDeployment();
        const addr = await contract.getAddress();
        console.log(`✅ ${name} @ ${addr}`);

        // Export ABI
        if (!fs.existsSync(ABI_DIR)) fs.mkdirSync(ABI_DIR, { recursive: true });
        fs.writeFileSync(path.join(ABI_DIR, `${name}.json`), JSON.stringify(artifact, null, 2));
        return { addr, contract };
    }

    try {
        // 1. Deploy Tokens
        const { addr: ntkAddr, contract: ntk } = await deploy("NTKToken", "NTK", wallet.address);
        const { addr: ntkrAddr, contract: ntkr } = await deploy("NTKRToken", "NTKR", wallet.address, wallet.address);

        // 2. Deploy Genesis NFT
        const { addr: genesisNftAddr, contract: genesisNft } = await deploy("GenesisNFT", "GenesisNFT");

        // 3. Deploy MultiSig
        const signers = [wallet.address]; 
        const threshold = 1;
        const timelock = 0;
        const { addr: multiSigAddr } = await deploy("BBSNSMultiSig", "BBSNSMultiSig", signers, threshold, timelock);

        // 4. Deploy Bootstrap Authority (Genesis Activation)
        const { addr: genesisActivationAddr, contract: genesisActivation } = await deploy("GenesisActivation", "GenesisActivation", genesisNftAddr, multiSigAddr);

        // 5. Deploy Registries
        // CRITICAL FIX: Pass GenesisActivation as initial governance, NOT MultiSig
        const { addr: notaryRegistryAddr } = await deploy("NotaryRegistry", "NotaryRegistry", genesisActivationAddr);
        const { addr: docRegistryAddr } = await deploy("DocumentRegistry", "DocumentRegistry", notaryRegistryAddr, ntkAddr);

        // 6. Execute Bootstrap Linkage
        console.log(`\n🔗 Linking Genesis Architecture...`);
        
        console.log(`   - Initializing NotaryRegistry in GenesisActivation...`);
        await (await genesisActivation.initializeRegistry(notaryRegistryAddr)).wait();
        
        console.log(`   - Minting Genesis NFT to designated Admin (${GENESIS_ADMIN_WALLET})...`);
        await (await genesisNft.mintGenesis(GENESIS_ADMIN_WALLET)).wait();

        // 7. Consolidate Token Authority to MultiSig
        console.log(`\n🔒 Consolidating token authority to MultiSig...`);
        console.log(`   - NTK: Granting Admin to MultiSig...`);
        await (await ntk.grantRole(DEFAULT_ADMIN_ROLE, multiSigAddr)).wait();
        console.log(`   - NTK: Revoking Admin from Deployer...`);
        await (await ntk.revokeRole(DEFAULT_ADMIN_ROLE, wallet.address)).wait();

        console.log(`   - NTKR: Granting Admin to MultiSig...`);
        await (await ntkr.grantRole(DEFAULT_ADMIN_ROLE, multiSigAddr)).wait();
        console.log(`   - NTKR: Revoking Admin from Deployer...`);
        await (await ntkr.revokeRole(DEFAULT_ADMIN_ROLE, wallet.address)).wait();

        // 8. Update Configurations
        const updateEnvFile = (filePath, updates) => {
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${filePath}`);
                return;
            }
            let content = fs.readFileSync(filePath, "utf-8");
            for (const [key, val] of Object.entries(updates)) {
                const regex = new RegExp(`^${key}=.*`, 'm');
                if (regex.test(content)) {
                    content = content.replace(regex, `${key}=${val}`);
                } else {
                    content += `\n${key}=${val}`;
                }
            }
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${filePath}`);
        };

        const backendUpdates = {
            "NTK_CONTRACT_ADDRESS": ntkAddr,
            "NTKR_CONTRACT_ADDRESS": ntkrAddr,
            "MULTISIG_CONTRACT_ADDRESS": multiSigAddr,
            "NOTARY_REGISTRY_ADDRESS": notaryRegistryAddr,
            "DOCUMENT_REGISTRY_ADDRESS": docRegistryAddr,
            "GENESIS_NFT_ADDRESS": genesisNftAddr,
            "GENESIS_ACTIVATION_ADDRESS": genesisActivationAddr
        };
        updateEnvFile(ENV_PATH, backendUpdates);

        const frontendUpdates = {
            "NEXT_PUBLIC_NTK_CONTRACT_ADDRESS": ntkAddr,
            "NEXT_PUBLIC_NTKR_CONTRACT_ADDRESS": ntkrAddr,
            "NEXT_PUBLIC_MULTISIG_ADDRESS": multiSigAddr,
            "NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS": docRegistryAddr,
            "NEXT_PUBLIC_GENESIS_NFT_ADDRESS": genesisNftAddr,
            "NEXT_PUBLIC_GENESIS_ACTIVATION_ADDRESS": genesisActivationAddr
        };
        updateEnvFile(FRONTEND_ENV_PATH, frontendUpdates);

        console.log(`\n🎉 TRUE GENESIS STACK FULLY DEPLOYED & SYNCED!`);
        console.log(`-----------------------------------------`);
        console.log(`NTK:             ${ntkAddr}`);
        console.log(`NTKR:            ${ntkrAddr}`);
        console.log(`Genesis NFT:     ${genesisNftAddr}`);
        console.log(`Activation:      ${genesisActivationAddr}`);
        console.log(`MultiSig:        ${multiSigAddr}`);
        console.log(`NotaryRegistry:  ${notaryRegistryAddr}`);
        console.log(`DocumentRegistry:${docRegistryAddr}`);
        console.log(`-----------------------------------------`);
        console.log(`🚨 IMPORTANT: Ensure you login with the Genesis Wallet: ${GENESIS_ADMIN_WALLET}`);

    } catch (err) {
        console.error("❌ Deployment Failed:", err);
    }
}

main();
