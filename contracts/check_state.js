import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const nftAddr = "0x923D2e70b8dFbCD39E55ffa29a4cFad33651a64e";
    const genesisAddr = "0x715EE2b2E29d9f5F37e9213952b267ab0fAE9646";
    const targetWallet = "0x91eD53552cA83709a06d5763315E09f5FC6cdD30";

    console.log(`\n🔍 AUDITING ON-CHAIN STATE`);
    
    const NFT = await ethers.getContractAt("GenesisNFT", nftAddr);
    const balance = await NFT.balanceOf(targetWallet);
    console.log(`- Genesis NFT Balance for ${targetWallet}: ${balance}`);

    const Genesis = await ethers.getContractAt("GenesisActivation", genesisAddr);
    const activated = await Genesis.activated();
    const initialized = await Genesis.registryInitialized();
    console.log(`- Genesis Activated: ${activated}`);
    console.log(`- Registry Initialized: ${initialized}`);
    
    const registryAddr = await Genesis.notaryRegistry();
    console.log(`- Linked Registry: ${registryAddr}`);

    const Registry = await ethers.getContractAt("NotaryRegistry", registryAddr);
    const role = await Registry.getUserRole(targetWallet);
    console.log(`- User Role on Registry: ${role}`);
}

main().catch(console.error);
