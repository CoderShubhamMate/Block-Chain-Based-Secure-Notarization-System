import hre from "hardhat";

async function main() {
    const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";
    const callerAddress = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    const docRegistry = "0xa798aB8171B09D4FCF5Bc8AA0621A9533FC7d769";
    
    console.log(`\n🔍 SIMULATING MULTISIG TRANSACTION SUBMISSION`);
    
    // We construct the transaction data for calling submitTransaction
    const MultiSig = await hre.ethers.getContractAt("BBSNSMultiSig", multisigAddress);
    
    // ABI signature for submitTransaction
    // function submitTransaction(address[] memory _to, uint256[] memory _value, bytes[] memory _data, bytes32 _proposalHash)
    const toArray = [docRegistry];
    const valueArray = [0n];
    const dataArray = ["0x"];
    const proposalHash = hre.ethers.ZeroHash;
    
    try {
        const txData = MultiSig.interface.encodeFunctionData("submitTransaction", [
            toArray,
            valueArray,
            dataArray,
            proposalHash
        ]);
        
        console.log(`- Encoded Calldata: ${txData}`);
        
        // Simulating the call from the admin address
        const response = await hre.ethers.provider.call({
            from: callerAddress,
            to: multisigAddress,
            data: txData
        });
        
        console.log(`✅ Simulation Call succeeded! Response: ${response}`);
        
        // Try estimating gas
        const gasEstimate = await hre.ethers.provider.estimateGas({
            from: callerAddress,
            to: multisigAddress,
            data: txData
        });
        console.log(`✅ Gas Estimate: ${gasEstimate.toString()}`);
    } catch (err) {
        console.error("❌ Simulation Reverted!");
        console.error(err);
    }
}

main().catch(console.error);
