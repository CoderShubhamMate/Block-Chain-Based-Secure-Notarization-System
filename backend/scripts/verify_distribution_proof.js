const { ethers } = require("ethers");
require("dotenv").config();
const ProviderService = require("../src/blockchain/provider-service");

async function main() {
    console.log("🔍 Fetching On-Chain Proof of NTK Distribution...");

    const provider = await ProviderService.getProvider();
    const ntkAddress = "0x981cE4Ef97B3A45f7ae02da8d2C228F9ae5B95aF";
    const notaryAddress = "0xf75f20de900233153795cf8f7e7350dcfd04dd35"; // Shubham Mate

    const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function symbol() view returns (string)"
    ];

    const ntk = new ethers.Contract(ntkAddress, abi, provider);

    const balance = await ntk.balanceOf(notaryAddress);
    const total = await ntk.totalSupply();
    const symbol = await ntk.symbol();

    console.log("------------------------------------");
    console.log(`- Notary: Shubham Mate (${notaryAddress})`);
    console.log(`- Current NTK Balance: ${ethers.formatUnits(balance, 18)} ${symbol}`);
    console.log(`- Total Supply: ${ethers.formatUnits(total, 18)} ${symbol}`);
    console.log("------------------------------------");

    if (parseFloat(ethers.formatUnits(balance, 18)) > 0) {
        console.log("✅ PROOF CONFIRMED: Tokens have been distributed.");
    } else {
        console.log("❌ NO PROOF: Balance is still zero.");
    }
}

main().catch(console.error);
