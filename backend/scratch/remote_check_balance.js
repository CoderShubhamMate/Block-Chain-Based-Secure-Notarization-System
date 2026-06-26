const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

async function run() {
    const addr = '0x02252Db03aF7CD8C8d3eC6CFd3AE5f6dab69ACd0';
    const balance = await provider.getBalance(addr);
    const nonce = await provider.getTransactionCount(addr);
    
    console.log('Address:', addr);
    console.log('Balance:', ethers.formatEther(balance), 'BNB');
    console.log('Nonce:', nonce);
}

run().catch(console.error);
