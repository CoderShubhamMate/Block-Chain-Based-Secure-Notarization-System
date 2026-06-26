import hre from "hardhat";

async function main() {
    const address = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    const balance = await hre.ethers.provider.getBalance(address);
    console.log(`\n💰 BALANCE CHECK FOR ${address}:`);
    console.log(`- Balance: ${hre.ethers.formatEther(balance)} BNB`);
}

main().catch(console.error);
