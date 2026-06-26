const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const multiSigAddress = '0xED1873d82766D61D3A5564A62b71C6DCc1403366';

async function run() {
    const abi = [
        "function threshold() view returns (uint256)",
        "function getSigners() view returns (address[])"
    ];
    const contract = new ethers.Contract(multiSigAddress, abi, provider);
    const [threshold, signers] = await Promise.all([
        contract.threshold(),
        contract.getSigners()
    ]);
    console.log('Threshold:', threshold.toString());
    console.log('Signers:', signers);
}

run().catch(console.error);
