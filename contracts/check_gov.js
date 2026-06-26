import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const registryAddr = "0xED95f2ca63FE854694b6eCB180F102daDBC12864";
    const genesisAddr = "0x715EE2b2E29d9f5F37e9213952b267ab0fAE9646";

    console.log(`\n🔍 GOVERNANCE AUDIT`);
    const Registry = await ethers.getContractAt("NotaryRegistry", registryAddr);
    const currentMultiSig = await Registry.multiSig();
    
    console.log(`- NotaryRegistry Address: ${registryAddr}`);
    console.log(`- Current MultiSig: ${currentMultiSig}`);
    console.log(`- Expected Genesis: ${genesisAddr}`);
    
    if (currentMultiSig.toLowerCase() === genesisAddr.toLowerCase()) {
        console.log(`✅ Governance is CORRECTLY transferred to Genesis.`);
    } else {
        console.log(`❌ Governance MISMATCH! Transfer failed.`);
    }
}

main().catch(console.error);
