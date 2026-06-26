import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const deployments = JSON.parse(fs.readFileSync("./deployments.json", "utf8"));
    const [deployer] = await ethers.getSigners();

    console.log("🚀 Deploying NEW GenesisActivation...");
    console.log(`- NotaryRegistry: ${deployments.notaryRegistry}`);
    
    // We use hardcoded defaults or env if available
    const genesisNft = process.env.GENESIS_NFT_ADDRESS || '0x6c84bE35c4a75a6A5c3a81C1dA07Ca01Fe29cdc7';
    const multiSig = process.env.MULTISIG_CONTRACT_ADDRESS || '0xB5392E306007eddE9015a8c5b0AF533E8067bC18';

    const GenesisActivation = await ethers.getContractFactory("GenesisActivation");
    const genesis = await GenesisActivation.deploy(genesisNft, multiSig);
    await genesis.waitForDeployment();
    const genesisAddress = await genesis.getAddress();
    console.log(`✅ GenesisActivation deployed to: ${genesisAddress}`);

    console.log("🛠️ Initializing Registry in Genesis contract...");
    await (await genesis.initializeRegistry(deployments.notaryRegistry)).wait();
    console.log("✅ Registry initialized.");

    console.log("🛡️ Transferring NotaryRegistry Governance to Genesis contract...");
    const NotaryRegistry = await ethers.getContractAt("NotaryRegistry", deployments.notaryRegistry);
    await (await NotaryRegistry.transferGovernance(genesisAddress)).wait();
    console.log("✅ Governance transferred. System is now ready for Genesis Onboarding.");

    // Update deployments
    deployments.genesisActivation = genesisAddress;
    fs.writeFileSync("./deployments.json", JSON.stringify(deployments, null, 2));
    
    console.log(`\n📂 New Genesis Activation Address: ${genesisAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
