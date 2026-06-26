const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const contract = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', [
    'function governance() view returns (address)',
    'function owner() view returns (address)',
    'function relayer() view returns (address)'
], provider);

async function run() {
    console.log('Governance:', await contract.governance().catch(e => e.message));
    console.log('Owner:', await contract.owner().catch(e => e.message));
    console.log('Relayer:', await contract.relayer().catch(e => e.message));
}

run().catch(console.error);
