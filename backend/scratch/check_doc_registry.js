const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

async function run() {
    const docRegistryAddr = '0x8fdaCefB6002F56A59cef36dA94e2ee9d55D7fe6';
    const notaryRegistryAddr = '0x1A820f5975dc41c904bF221df342191694Da1f98';
    
    const docRegistry = new ethers.Contract(docRegistryAddr, [
        "function notaryRegistry() view returns (address)",
        "function isNotary(address) view returns (bool)"
    ], provider);

    try {
        const linkedNotaryRegistry = await docRegistry.notaryRegistry();
        console.log(`DocumentRegistry's NotaryRegistry: ${linkedNotaryRegistry}`);
        console.log(`Target NotaryRegistry: ${notaryRegistryAddr}`);
        
        const notary = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
        const isNotaryResult = await docRegistry.isNotary(notary);
        console.log(`Is Shubham a Notary according to DocumentRegistry? ${isNotaryResult}`);
    } catch (e) {
        console.error("Error querying DocumentRegistry:", e.message);
    }
}

run().catch(console.error);
