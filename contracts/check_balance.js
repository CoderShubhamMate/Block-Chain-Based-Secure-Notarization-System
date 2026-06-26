import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const targetWallet = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    const bal = await ethers.provider.getBalance(targetWallet);
    console.log(`\n💰 BALANCE CHECK`);
    console.log(`- Wallet: ${targetWallet}`);
    console.log(`- Balance: ${ethers.formatEther(bal)} tBNB`);
}

main().catch(console.error);
