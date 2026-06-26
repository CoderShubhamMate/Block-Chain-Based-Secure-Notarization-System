const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const contract = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', ['function getUserRole(address) view returns (uint8)'], provider);

async function run() {
    const relayerRemote = '0x02252Db03aF7CD8C8d3eC6CFd3AE5f6dab69ACd0';
    const relayerLocal = '0x2f5b7e4A1ED7966ba4E0100a126D8125654cEFE6';
    const notary = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    
    const roleRemote = await contract.getUserRole(relayerRemote);
    const roleLocal = await contract.getUserRole(relayerLocal);
    const roleNotary = await contract.getUserRole(notary);
    
    console.log(`Remote Relayer Role:`, Number(roleRemote));
    console.log(`Local Relayer Role:`, Number(roleLocal));
    console.log(`Notary Role:`, Number(roleNotary));
}

run().catch(console.error);
