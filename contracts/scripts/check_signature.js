import { ethers } from "ethers";

async function main() {
    const rpc = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const provider = new ethers.JsonRpcProvider(rpc);
    
    const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";
    const callerAddress = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    const target = "0xa798aB8171B09D4FCF5Bc8AA0621A9533FC7d769";
    
    console.log(`\n🔍 SIGNATURE CHECK ON MULTISIG`);
    
    // We will try different ABIs to see if they succeed in simulation
    const abis = {
        "singular_with_hash": "function submitTransaction(address, uint256, bytes, bytes32) external",
        "singular_without_hash": "function submitTransaction(address, uint256, bytes) external",
        "array_with_hash": "function submitTransaction(address[] memory, uint256[] memory, bytes[] memory, bytes32) external",
        "array_without_hash": "function submitTransaction(address[] memory, uint256[] memory, bytes[] memory) external"
    };
    
    for (const [name, signature] of Object.entries(abis)) {
        try {
            console.log(`\nTesting: ${name} -> ${signature}`);
            const iface = new ethers.Interface([signature]);
            let calldata;
            if (name === "singular_with_hash") {
                calldata = iface.encodeFunctionData("submitTransaction", [target, 0n, "0x", ethers.ZeroHash]);
            } else if (name === "singular_without_hash") {
                calldata = iface.encodeFunctionData("submitTransaction", [target, 0n, "0x"]);
            } else if (name === "array_with_hash") {
                calldata = iface.encodeFunctionData("submitTransaction", [[target], [0n], ["0x"], ethers.ZeroHash]);
            } else if (name === "array_without_hash") {
                calldata = iface.encodeFunctionData("submitTransaction", [[target], [0n], ["0x"]]);
            }
            
            await provider.call({
                from: callerAddress,
                to: multisigAddress,
                data: calldata
            });
            console.log(`✅ Success for: ${name}`);
        } catch (err) {
            console.log(`❌ Failed for: ${name}. Error: ${err.message.substring(0, 100)}`);
        }
    }
}

main();
