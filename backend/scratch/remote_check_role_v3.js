const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const contract = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', ['function getUserRole(address) view returns (uint8)'], provider);

async function run() {
    const addresses = [
        ['Remote Relayer', '0x02252Db03aF7CD8C8d3eC6CFd3AE5f6dab69ACd0'],
        ['Local Relayer', '0x2f5b7e4A1ED7966ba4E0100a126D8125654cEFE6'],
        ['Multisig', '0xED1873d82766D61D3A5564A62b71C6DCc1403366'],
        ['Notary', '0xa82a6fcbb2db5979a6fcca83c24317605580310e']
    ];
    
    for (const [name, addr] of addresses) {
        const role = await contract.getUserRole(addr);
        console.log(`${name} (${addr}) Role:`, Number(role));
    }
}

run().catch(console.error);
