import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const [deployer] = await ethers.getSigners();
    const targetWallet = "0x91eD53552cA83709a06d5763315E09f5FC6cdD30";
    const relayer = deployer.address;
    const treasury = deployer.address;

    console.log(`\n🌩️  INITIATING TOTAL SYSTEM REDEPLOYMENT`);
    console.log(`- Network: BNB Testnet`);
    console.log(`- Deployer/Relayer: ${relayer}`);
    console.log(`- Target Genesis Owner: ${targetWallet}\n`);

    const deploy = async (name, ...args) => {
        console.log(`📦 Deploying ${name}...`);
        const factory = await ethers.getContractFactory(name);
        const contract = await factory.deploy(...args);
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        console.log(`   ✅ ${name} -> ${address}`);
        return { contract, address };
    };

    // 1. Genesis NFT
    const { contract: nft, address: nftAddr } = await deploy("GenesisNFT");

    // 2. NotaryRegistry
    const { contract: registry, address: registryAddr } = await deploy("NotaryRegistry", relayer);

    // 3. NTK Token
    const { address: ntkAddr } = await deploy("NTKToken", relayer);

    // 4. NTKR Token
    const { address: ntkrAddr } = await deploy("NTKRToken", relayer, treasury);

    // 5. DocumentRegistry
    const { address: docAddr } = await deploy("DocumentRegistry", registryAddr, ntkAddr);

    // 6. GenesisActivation
    const { contract: genesis, address: genesisAddr } = await deploy("GenesisActivation", nftAddr, relayer);

    console.log(`\n🛠️  PERFORMING BINDING & SETUP`);

    // A. Initialize Registry in Genesis
    console.log(`- Initializing Registry in Genesis...`);
    await (await genesis.initializeRegistry(registryAddr)).wait();

    // B. Transfer Governance
    console.log(`- Transferring NotaryRegistry Governance to Genesis...`);
    await (await registry.transferGovernance(genesisAddr)).wait();

    // C. Mint Genesis NFT
    console.log(`- Minting Genesis NFT #1 to ${targetWallet}...`);
    await (await nft.mintGenesis(targetWallet)).wait();

    console.log(`\n✨  REDEPLOYMENT COMPLETE`);

    const deployments = {
        network: "bnbTestnet",
        genesisNft: nftAddr,
        notaryRegistry: registryAddr,
        ntk: ntkAddr,
        ntkr: ntkrAddr,
        documentRegistry: docAddr,
        genesisActivation: genesisAddr,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync("./deployments.json", JSON.stringify(deployments, null, 2));
    console.log(`📂 Saved to deployments.json`);

    // Update Local .env (relative to /contracts folder)
    const envPath = "../Backend/.env";
    let envContent = fs.readFileSync(envPath, "utf8");
    
    const update = (key, val) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        envContent = envContent.replace(regex, `${key}=${val}`);
    };

    update("GENESIS_NFT_ADDRESS", nftAddr);
    update("NOTARY_REGISTRY_ADDRESS", registryAddr);
    update("NTK_CONTRACT_ADDRESS", ntkAddr);
    update("NTKR_CONTRACT_ADDRESS", ntkrAddr);
    update("DOCUMENT_REGISTRY_ADDRESS", docAddr);
    update("GENESIS_ACTIVATION_ADDRESS", genesisAddr);

    fs.writeFileSync(envPath, envContent);
    console.log(`🔧 Updated Local Backend .env`);
}

main().catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:", error);
    process.exit(1);
});
