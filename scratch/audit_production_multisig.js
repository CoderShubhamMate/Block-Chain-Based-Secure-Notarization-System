const { ethers } = require("ethers");
const RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
const MULTISIG_ADDR = "0x60a890196c56Be66a070f1De0Aca8B1cF07C353a";
const NFT_ADDR = "0x1c2ce398F063580F8b571222a39bC432565eF273";

async function check() {
    const provider = new ethers.JsonRpcProvider(RPC);
    
    // 1. Audit MultiSig
    const multisig = new ethers.Contract(
        MULTISIG_ADDR,
        ["function getSigners() view returns (address[])", "function threshold() view returns (uint256)"],
        provider
    );
    const signers = await multisig.getSigners();
    const threshold = await multisig.threshold();

    // 2. Audit NFT Owner
    const nft = new ethers.Contract(
        NFT_ADDR,
        ["function ownerOf(uint256) view returns (address)"],
        provider
    );
    let nftOwner = "None";
    try {
        nftOwner = await nft.ownerOf(1);
    } catch (e) {
        nftOwner = "Not minted yet (or ID 1 invalid)";
    }

    console.log("--- BBSNS Production Audit Report ---");
    console.log(`Active MultiSig: ${MULTISIG_ADDR}`);
    console.log(`Threshold:       ${threshold}`);
    console.log(`Signers:         ${signers.join(", ")}`);
    console.log(`-------------------------------------`);
    console.log(`Genesis NFT:     ${NFT_ADDR}`);
    console.log(`NFT Holder (Admin): ${nftOwner}`);
}

check().catch(console.error);
