const { ethers } = require("ethers");
const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";

async function main() {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const arrayAbi = [
        "function getTransaction(uint256 _txIndex) public view returns (address[] memory to, uint256[] memory value, bytes[] memory data, bool executed, uint256 numConfirmations, uint256 submissionTime, uint256 txSignerVersion)",
        "function getTransactionCount() public view returns (uint256)"
    ];
    
    const singleAbi = [
        "function getTransaction(uint256 _txIndex) public view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations, uint256 submissionTime, uint256 txSignerVersion)",
        "function getTransactionCount() public view returns (uint256)"
    ];

    console.log("Querying transaction count...");
    const contractWithArray = new ethers.Contract(multisigAddress, arrayAbi, provider);
    const contractWithSingle = new ethers.Contract(multisigAddress, singleAbi, provider);
    
    try {
        const count = await contractWithArray.getTransactionCount();
        console.log(`Transaction count: ${count}`);
        
        if (count > 0) {
            console.log("Trying to fetch transaction 0 using Array-based ABI...");
            try {
                const txArray = await contractWithArray.getTransaction(0);
                console.log("Array-based ABI SUCCESS:", txArray);
            } catch (err) {
                console.log("Array-based ABI FAILED:", err.message);
            }
            
            console.log("Trying to fetch transaction 0 using Single-based ABI...");
            try {
                const txSingle = await contractWithSingle.getTransaction(0);
                console.log("Single-based ABI SUCCESS:", txSingle);
            } catch (err) {
                console.log("Single-based ABI FAILED:", err.message);
            }
        } else {
            console.log("No transactions submitted yet. Checking getTransaction(0) anyway...");
            try {
                await contractWithArray.getTransaction(0);
            } catch (err) {
                console.log("Array getTransaction(0) error:", err.message);
            }
        }
    } catch (err) {
        console.error("Failed to query transaction count:", err.message);
    }
}

main().catch(console.error);
