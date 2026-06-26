const { ethers } = require('/home/ubuntu/backend/node_modules/ethers');

async function check() {
    const address = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const rpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545';
    const registryAddress = '0x5831dF2b77Fd728fea9748EBa39C907B39f597c7';
    const multisigAddress = '0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA';
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const registry = new ethers.Contract(
        registryAddress,
        ["function getUserRole(address) view returns (uint8)", "function isBanned(address) view returns (bool)"],
        provider
    );
    
    const multisig = new ethers.Contract(
        multisigAddress,
        ["function getSigners() view returns (address[])", "function threshold() view returns (uint256)"],
        provider
    );
    
    try {
        console.log('=== ON-CHAIN QUERY FOR WALLET: ' + address + ' ===');
        const [role, banned, signers, threshold] = await Promise.all([
            registry.getUserRole(address),
            registry.isBanned(address),
            multisig.getSigners(),
            multisig.threshold()
        ]);
        
        console.log(`NotaryRegistry.getUserRole: ${role} (${role === 2n ? 'NOTARY' : role === 3n ? 'ADMIN' : 'OTHER'})`);
        console.log(`NotaryRegistry.isBanned: ${banned}`);
        console.log(`BBSNSMultiSig Signers:`, signers);
        console.log(`BBSNSMultiSig Threshold:`, threshold.toString());
        
        const isSigner = signers.map(s => s.toLowerCase()).includes(address.toLowerCase());
        console.log(`Is this wallet a MultiSig signer? ${isSigner}`);
    } catch (err) {
        console.error('On-chain query failed:', err);
    }
}

check();
