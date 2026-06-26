const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

async function run() {
    const docRegistryAddr = '0x8fdaCefB6002F56A59cef36dA94e2ee9d55D7fe6';
    const notaryRegistryAddr = '0x1A820f5975dc41c904bF221df342191694Da1f98';
    
    const docRegistry = new ethers.Contract(docRegistryAddr, [
        "function paused() view returns (bool)"
    ], provider);

    const notaryRegistry = new ethers.Contract(notaryRegistryAddr, [
        "function relayer() view returns (address)"
    ], provider);

    const isPaused = await docRegistry.paused();
    const currentRelayer = await notaryRegistry.relayer();
    
    console.log(`DocumentRegistry Paused? ${isPaused}`);
    console.log(`Configured Relayer in NotaryRegistry: ${currentRelayer}`);
    console.log(`Our Relayer Address: 0x02252Db03aF7CD8C8d3eC6CFd3AE5f6dab69ACd0`);
}

run().catch(console.error);
