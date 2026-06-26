const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const contract = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', ['function multiSig() view returns (address)'], provider);

async function run() {
    console.log('MultiSig on NotaryRegistry:', await contract.multiSig());
}

run().catch(console.error);
