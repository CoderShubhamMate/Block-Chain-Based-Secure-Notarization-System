const { ethers } = require('ethers');
const { logger } = require('../utils/logger');

/**
 * 🛡️ [RESILIENCE] Hierarchical Consensus Engine (ProviderService)
 * Implements: Sticky Provider, Multi-Tier Failover, Block Consensus, Health Tracking.
 */

const TIERS = {
    T1: [
        process.env.RPC_URL, // Authority Source
        'https://rpc.ankr.com/bsc_testnet_chapel',
        'https://bsc-testnet.nodereal.io/v1/e9a36765274544fba208f0E272C55db2',
        'https://data-seed-prebsc-1-s1.binance.org:8545'
    ],
    T2: [
        'https://bsc-testnet.public.blastapi.io',
        'https://endpoints.omniatech.io/v1/bsc/testnet/public',
        'https://bnb-testnet.api.onfinality.io/public'
    ],
    T3: [
        'https://data-seed-prebsc-2-s1.bnbchain.org:8545'
    ]
};

class ProviderService {
    constructor() {
        this.providers = new Map();
        this.metrics = new Map();
        this.blacklist = new Map();
        this.stickyUrl = null;
        this.lastGoodBlock = 0;
        this.lastGoodBlockTs = 0;
        
        this.BLACKLIST_DURATION_MS = 30000; // 30s
        this.TIMEOUT_MS = 5000; // 5s stall timeout (Harden for slow testnet nodes)
        this.LAG_THRESHOLD = 5; // Allow 5 blocks lag
        
        this.initializeProviders();
    }

    initializeProviders() {
        Object.values(TIERS).flat().forEach(url => {
            this.metrics.set(url, {
                success: 0,
                fail: 0,
                latency: [],
                lastSeen: 0
            });
            
            // We use staticNetwork: true with explicit chainId to prevent redundant detectNetwork polls
            try {
                let provider;
                if (url.startsWith('wss')) {
                    provider = new ethers.WebSocketProvider(url);
                } else {
                    // Pass the network explicitly to avoid detectNetwork call
                    provider = new ethers.JsonRpcProvider(url, { chainId: 97, name: 'bnbt' }, { staticNetwork: true });
                }
                
                this.providers.set(url, provider);
            } catch (err) {
                console.error(`[PROVIDER_SERVICE] ❌ Failed to init ${url}: ${err.message}`);
            }
        });
    }

    /**
     * 🛡️ getProvider() - Returns the best active provider using Sticky Logic
     */
    async getProvider() {
        // 1. Try sticky provider first
        if (this.stickyUrl && !this.isBlacklisted(this.stickyUrl)) {
            const p = this.providers.get(this.stickyUrl);
            if (p) return p;
        }

        // 2. Discover new sticky provider from T1 -> T2 -> T3
        const tiers = ['T1', 'T2', 'T3'];
        for (const tierName of tiers) {
            const urls = TIERS[tierName];
            for (const url of urls) {
                if (this.isBlacklisted(url)) continue;
                
                try {
                    const p = this.providers.get(url);
                    if (!p) continue;

                    // Verify health before making sticky
                    const start = Date.now();
                    const block = await Promise.race([
                        p.getBlockNumber(),
                        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), this.TIMEOUT_MS))
                    ]);

                    this.recordSuccess(url, Date.now() - start, block);
                    this.stickyUrl = url;
                    return p;
                } catch (err) {
                    console.warn(`[PROVIDER_SERVICE] ⚠️ Health check failed for ${url}: ${err.message}`);
                    this.recordFailure(url);
                    continue;
                }
            }
        }

        throw new Error("FATAL: All blockchain RPC tiers exhausted.");
    }

    /**
     * 🛡️ getConsensusBlock() - Deterministic Network Truth
     * Aggregates MAX(block) and filters lagging nodes.
     */
    async getConsensusBlock() {
        const candidates = [];
        const t1Urls = TIERS.T1.slice(0, 3); // Sample first 3 T1s

        await Promise.all(t1Urls.map(async (url) => {
            if (this.isBlacklisted(url)) return;
            try {
                const p = this.providers.get(url);
                const start = Date.now();
                const block = await Promise.race([
                    p.getBlockNumber(),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), this.TIMEOUT_MS))
                ]);
                this.recordSuccess(url, Date.now() - start, block);
                candidates.push(block);
            } catch (err) {
                this.recordFailure(url);
            }
        }));

        if (candidates.length === 0) {
            // If T1 fails, try to return current lastGoodBlock or trigger failover
            return this.lastGoodBlock;
        }

        const maxBlock = Math.max(...candidates);
        
        // 🛡️ NO-DOWNGRADE POLICY
        if (maxBlock > this.lastGoodBlock) {
            this.lastGoodBlock = maxBlock;
            this.lastGoodBlockTs = Date.now();
        }

        return this.lastGoodBlock;
    }

    isBlacklisted(url) {
        const expiry = this.blacklist.get(url);
        if (!expiry) return false;
        if (Date.now() > expiry) {
            this.blacklist.delete(url);
            return false;
        }
        return true;
    }

    recordSuccess(url, latency, block) {
        const m = this.metrics.get(url);
        m.success++;
        m.lastSeen = Date.now();
        m.latency.push(latency);
        if (m.latency.length > 10) m.latency.shift(); // Keep last 10

        // 🛡️ BLOCK CONSENSUS LAG CHECK
        if (this.lastGoodBlock > 0 && (this.lastGoodBlock - block) > this.LAG_THRESHOLD) {
            console.warn(`[PROVIDER_SERVICE] Node ${url} lagging by ${this.lastGoodBlock - block} blocks. Blacklisting.`);
            this.recordFailure(url); 
        }

        logger.info(`[RPC_CONSENSUS] url=${url} latency=${latency}ms block=${block} tier=${this.getTier(url)}`);
    }

    recordFailure(url) {
        const m = this.metrics.get(url);
        m.fail++;
        
        // Blacklist if failure rate high or on critical stall
        if (m.fail % 3 === 0) {
            console.error(`[PROVIDER_SERVICE] Blacklisting unstable node ${url} for 30s`);
            this.blacklist.set(url, Date.now() + this.BLACKLIST_DURATION_MS);
            if (this.stickyUrl === url) this.stickyUrl = null;
        }
    }

    getTier(url) {
        if (TIERS.T1.includes(url)) return 'T1';
        if (TIERS.T2.includes(url)) return 'T2';
        return 'T3';
    }

    isSystemHealthy() {
        // 🛡️ [RESILIENCE] Grace Window: 5 minutes (300s) to survive Testnet brownouts
        return (Date.now() - this.lastGoodBlockTs) < 300000;
    }

    /**
     * 🛡️ reset() - Forces a clean slate for provider discovery
     */
    reset() {
        this.blacklist.clear();
        this.stickyUrl = null;
        console.log("[PROVIDER_SERVICE] 🔄 Provider state reset. Re-indexing tiers...");
    }
}

module.exports = new ProviderService();
