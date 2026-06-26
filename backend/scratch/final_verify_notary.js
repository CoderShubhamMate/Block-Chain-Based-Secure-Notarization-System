const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const registry = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', ['function getUserRole(address) view returns (uint8)'], provider);

async function run() {
    const notary = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const role = await registry.getUserRole(notary);
    console.log(`Notary Address: ${notary}`);
    console.log(`Confirmed Role on Blockchain: ${role}`);
}

run().catch(console.error);
