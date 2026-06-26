const { ethers } = require('ethers');
const fs = require('fs');

async function check() {
    const address = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const rpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545';
    const registryAddress = '0x5831dF2b77Fd728fea9748EBa39C907B39f597c7';
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const registry = new ethers.Contract(
        registryAddress,
        ["function getUserRole(address) view returns (uint8)", "function isBanned(address) view returns (bool)"],
        provider
    );
    
    try {
        const [role, banned] = await Promise.all([
            registry.getUserRole(address),
            registry.isBanned(address)
        ]);
        
        console.log(`Address: ${address}`);
        console.log(`Role: ${role}`);
        console.log(`Banned: ${banned}`);
        console.log(`Status: ${Number(role) === 2 ? 'NOTARY' : 'OTHER'}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
