const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const contract = new ethers.Contract('0x1A820f5975dc41c904bF221df342191694Da1f98', ['function isNotary(address) view returns (bool)'], provider);
async function check() {
    const addresses = [
        '0x4bbb045c0b546Ed9d9e5d5BCfb50c37Ca02706f4',
        '0xa82a6fcbb2db5979a6fcca83c24317605580310e',
        '0x40375E013E8D0976192807f4336B57388C838A20'
    ];
    for (const addr of addresses) {
        try {
            const checksumAddr = ethers.getAddress(addr);
            console.log(`${checksumAddr}:`, await contract.isNotary(checksumAddr));
        } catch (e) {
            console.log(`${addr}: INVALID`);
        }
    }
}
check();
