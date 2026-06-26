const { ethers } = require("ethers");
require("dotenv").config();
const ProviderService = require("../src/blockchain/provider-service");

async function main() {
    console.log("🔍 Auditing On-Chain Governance...");

    const provider = await ProviderService.getProvider();
    
    // Addresses from user snapshot/deployments
    const notaryRegistryAddr = "0x0DD325C87CDF2B00ef6cE9de537AFD4826c98f3c";
    const ntkAddr = "0x981cE4Ef97B3A45f7ae02da8d2C228F9ae5B95aF";

    const registryAbi = [
        "function multiSig() view returns (address)",
        "function relayer() view returns (address)"
    ];

    const ntkAbi = [
        "function hasRole(bytes32 role, address account) view returns (bool)"
    ];

    const registry = new ethers.Contract(notaryRegistryAddr, registryAbi, provider);
    const ntk = new ethers.Contract(ntkAddr, ntkAbi, provider);

    const onChainMultiSig = await registry.multiSig();
    const onChainRelayer = await registry.relayer();

    console.log(`- NotaryRegistry MultiSig: ${onChainMultiSig}`);
    console.log(`- NotaryRegistry Relayer: ${onChainRelayer}`);

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));

    const isMultiSigAdmin = await ntk.hasRole(DEFAULT_ADMIN_ROLE, onChainMultiSig);
    const isRelayerAdmin = await ntk.hasRole(DEFAULT_ADMIN_ROLE, onChainRelayer);

    console.log(`- Is MultiSig (${onChainMultiSig}) NTK Admin: ${isMultiSigAdmin}`);
    console.log(`- Is Relayer (${onChainRelayer}) NTK Admin: ${isRelayerAdmin}`);
}

main().catch(console.error);
