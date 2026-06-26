const { ethers } = require("ethers");
require("dotenv").config();
const ProviderService = require("../src/blockchain/provider-service");

async function main() {
    console.log("🔍 Verifying NTK Identity...");

    const provider = await ProviderService.getProvider();
    const ntkAddress = "0x981cE4Ef97B3A45f7ae02da8d2C228F9ae5B95aF";
    
    const abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function hasRole(bytes32 role, address account) view returns (bool)"
    ];

    const ntk = new ethers.Contract(ntkAddress, abi, provider);

    try {
        const name = await ntk.name();
        const symbol = await ntk.symbol();
        console.log(`- Contract Name: ${name}`);
        console.log(`- Contract Symbol: ${symbol}`);

        if (name !== "Notary Action Token") {
            console.error("❌ ERROR: Name mismatch! Expected 'Notary Action Token'");
        }
    } catch (err) {
        console.error("❌ ERROR: Failed to fetch metadata. Is it a contract?", err.message);
    }

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const addresses = [
        "0x2f5b7e4A1ED7966ba4E0100a126D8125654cEFE6",
        "0x11FBDd7F0895526a6945C114e0fBaDF4Bf6159b3",
        "0xB5392E306007eddE9015a8c5b0AF533E8067bC18",
        "0x91eD53552cA83709a06d5763315E09f5FC6cdD30"
    ];

    for (const addr of addresses) {
        const isAdmin = await ntk.hasRole(DEFAULT_ADMIN_ROLE, addr);
        console.log(`Address ${addr} isAdmin: ${isAdmin}`);
    }
}

main().catch(console.error);
