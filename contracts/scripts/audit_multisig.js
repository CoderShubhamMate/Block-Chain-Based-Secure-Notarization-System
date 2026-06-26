import hre from "hardhat";

async function main() {
    const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";
    const callerAddress = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    
    console.log(`\n🔍 AUDITING MULTISIG AT: ${multisigAddress}`);
    const MultiSig = await hre.ethers.getContractAt("BBSNSMultiSig", multisigAddress);
    
    try {
        const threshold = await MultiSig.threshold();
        console.log(`- Threshold: ${threshold.toString()}`);
        
        const signers = await MultiSig.getSigners();
        console.log(`- Signers:`, signers);
        
        const isCallerSigner = await MultiSig.isSigner(callerAddress);
        console.log(`- Is Caller (${callerAddress}) a Signer? ${isCallerSigner}`);
        
        const signerVersion = await MultiSig.signerVersion();
        console.log(`- Signer Version: ${signerVersion.toString()}`);
        
        const transactionCount = await MultiSig.getTransactionCount();
        console.log(`- Total Transactions: ${transactionCount.toString()}`);
    } catch (err) {
        console.error("❌ Failed to query MultiSig contract:", err.message);
    }
}

main().catch(console.error);
