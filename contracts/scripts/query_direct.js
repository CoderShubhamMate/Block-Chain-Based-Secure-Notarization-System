import { ethers } from "ethers";

async function main() {
    const rpc = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const provider = new ethers.JsonRpcProvider(rpc);
    
    const callerAddress = "0xa2E179f85B1efd03e8c12a7751928653977f7ad2";
    
    // Addresses from Remote Auth .env
    const activationAddress = "0xea1e13445bB14c8cD53AE248096612Cb2F397A1e";
    const registryAddress = "0x5831dF2b77Fd728fea9748EBa39C907B39f597c7";
    const multisigAddress = "0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA";
    
    console.log(`\n🔍 FULL STATE AUDIT ON-CHAIN`);
    
    try {
        const Activation = new ethers.Contract(activationAddress, [
            "function activated() view returns (bool)",
            "function registryInitialized() view returns (bool)",
            "function notaryRegistry() view returns (address)"
        ], provider);
        
        const activated = await Activation.activated();
        const registryInitialized = await Activation.registryInitialized();
        const linkedRegistry = await Activation.notaryRegistry();
        
        console.log(`- GenesisActivation (${activationAddress}):`);
        console.log(`  - Activated: ${activated}`);
        console.log(`  - Registry Initialized: ${registryInitialized}`);
        console.log(`  - Linked Registry: ${linkedRegistry}`);
        
        const Registry = new ethers.Contract(registryAddress, [
            "function multiSig() view returns (address)",
            "function getUserRole(address) view returns (uint8)",
            "function roles(address) view returns (uint8)"
        ], provider);
        
        const currentMultiSig = await Registry.multiSig();
        const callerRole = await Registry.getUserRole(callerAddress);
        
        console.log(`- NotaryRegistry (${registryAddress}):`);
        console.log(`  - Current Governance / MultiSig: ${currentMultiSig}`);
        console.log(`  - Caller Role (1=Owner, 2=Notary, 3=Admin): ${callerRole.toString()}`);
        
    } catch (err) {
        console.error("❌ Audit failed:", err);
    }
}

main();
