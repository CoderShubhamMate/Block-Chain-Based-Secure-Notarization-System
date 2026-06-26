
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
    
    const NTK_ADDRESS = "0x0d92A3De88202C929714df9cB24395CF4C15ba2e";
    const DOC_REGISTRY = "0x8fdaCefB6002F56A59cef36dA94e2ee9d55D7fe6";
    const RELAYER = "0x02252Db03aF7CD8C8d3eC6CFd3AE5f6dab69ACd0";

    const abi = [
        "function hasRole(bytes32 role, address account) public view returns (bool)",
        "function RELAYER_ROLE() public view returns (bytes32)"
    ];

    const ntk = new ethers.Contract(NTK_ADDRESS, abi, provider);
    const RELAYER_ROLE = await ntk.RELAYER_ROLE();

    console.log("Checking roles on NTKToken...");
    const relayerHasRole = await ntk.hasRole(RELAYER_ROLE, RELAYER);
    const docRegistryHasRole = await ntk.hasRole(RELAYER_ROLE, DOC_REGISTRY);

    console.log(`Relayer (${RELAYER}) has RELAYER_ROLE: ${relayerHasRole}`);
    console.log(`DocRegistry (${DOC_REGISTRY}) has RELAYER_ROLE: ${docRegistryHasRole}`);
}

main().catch(console.error);
