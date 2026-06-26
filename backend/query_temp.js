const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    try {
        const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
        const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";

        console.log("Querying correct Multisig contract directly:", multisigAddress);

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const abi = [
            "function getTransaction(uint256) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations, uint256 submissionTime, uint256 txSignerVersion)",
            "function getTransactionCount() view returns (uint256)"
        ];

        const contract = new ethers.Contract(multisigAddress, abi, provider);

        const txCount = await contract.getTransactionCount();
        console.log("Transaction count:", txCount.toString());

        for (let i = 0; i < txCount; i++) {
            const tx = await contract.getTransaction(i);
            console.log(`TxIndex: ${i} | Destination: ${tx.to} | Value: ${tx.value.toString()} | Executed: ${tx.executed} | NumConfirmations: ${tx.numConfirmations.toString()}`);
        }

    } catch (e) {
        console.error(e);
    }
}

main();
