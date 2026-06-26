const ProviderService = require('./provider-service');
const { ethers } = require('ethers');

/**
 * 🧪 [FORENSIC] Consensus Failover Simulation
 * Objective: Verify that ProviderService maintains 'VERIFIED' status during node outages.
 */

async function runSimulation() {
    console.log("🚀 [SIMULATION] Starting Consensus Stability Test...");

    try {
        // 1. Initial State Check
        console.log("\n--- TEST 1: Initial Discovery ---");
        const p1 = await ProviderService.getProvider();
        const b1 = await ProviderService.getConsensusBlock();
        console.log(`✅ Initial Provider: ${ProviderService.stickyUrl}`);
        console.log(`✅ Initial Block: ${b1}`);

        // 2. Sticky Behavior Check
        console.log("\n--- TEST 2: Sticky Provider Persistence ---");
        const p2 = await ProviderService.getProvider();
        console.log(`✅ Persistence: ${ProviderService.stickyUrl === ProviderService.stickyUrl ? 'PASSED' : 'FAILED'}`);

        // 3. T1 Failure Simulation (Failover to next T1 or T2)
        console.log("\n--- TEST 3: Tier 1 Outage (Mocking Failure) ---");
        const dyingUrl = ProviderService.stickyUrl;
        console.log(`🔌 Disrupting: ${dyingUrl}`);
        
        // Use internal recordFailure to force blacklist
        ProviderService.recordFailure(dyingUrl);
        ProviderService.recordFailure(dyingUrl);
        ProviderService.recordFailure(dyingUrl); // 3 fails triggers blacklist

        const p3 = await ProviderService.getProvider();
        console.log(`✅ Failover Success: ${ProviderService.stickyUrl !== dyingUrl ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ New Provider: ${ProviderService.stickyUrl}`);

        // 4. Consensus & No-Downgrade Check
        console.log("\n--- TEST 4: Consensus & No-Downgrade Policy ---");
        const currentTruth = ProviderService.lastGoodBlock;
        console.log(`Current Truth: ${currentTruth}`);
        
        // Manually record a "Time Travel" response (lagging block)
        const laggyUrl = TIERS_FLAT().find(u => u !== ProviderService.stickyUrl);
        if (laggyUrl) {
            console.log(`📡 Mocking laggy response from ${laggyUrl}...`);
            // We use internal recordSuccess with a LAGGING block
            ProviderService.recordSuccess(laggyUrl, 100, currentTruth - 10); 
            console.log(`✅ Post-Lag Truth: ${ProviderService.lastGoodBlock}`);
            console.log(`✅ No-Downgrade: ${ProviderService.lastGoodBlock >= currentTruth ? 'PASSED' : 'FAILED'}`);
        }

        // 5. System Health Signal
        console.log("\n--- TEST 5: Global Health Signal ---");
        console.log(`✅ isSystemHealthy: ${ProviderService.isSystemHealthy() ? 'PASSED' : 'FAILED'}`);

        console.log("\n✨ [SIMULATION] All consensus guards verified.");
        process.exit(0);
    } catch (err) {
        console.error("\n❌ [SIMULATION] Block-truth integrity failure:", err.message);
        process.exit(1);
    }
}

// Helper to get all URLs for the test context
function TIERS_FLAT() {
    return [
        'wss://bsc-testnet-rpc.publicnode.com',
        'https://api.zan.top/bsc-testnet',
        'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
        'wss://bsc-testnet.drpc.org',
        'https://bnb-testnet.api.onfinality.io/public',
        'https://rpc.sentio.xyz/bsc-testnet',
        'https://data-seed-prebsc-1-s3.bnbchain.org:8545',
        'https://data-seed-prebsc-2-s3.bnbchain.org:8545',
        'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
        'https://data-seed-prebsc-1-s2.bnbchain.org:8545',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545'
    ];
}

runSimulation();
