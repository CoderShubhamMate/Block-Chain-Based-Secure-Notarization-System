/**
 * 🛡️ [RESILIENCE] Authoritative Block Cache (Single-Flight)
 * Prevents RPC storms by deduplicating concurrent block number requests
 * and providing a fail-safe 'last good block' reference for grace-period resolution.
 */

class BlockCache {
    constructor() {
        this.lastGoodBlock = null;
        this.lastGoodBlockTimestamp = null;
        this.activePromise = null;
        this.refreshThreshold = 3000; // 3 seconds TTL for VERIFIED state
    }

    /**
     * @param {Object} provider - Ethers JSON-RPC provider
     * @returns {Object} { block: number, timestamp: number, isStale: boolean }
     */
    async getLatest(provider) {
        const now = Date.now();

        // 1. If we have a fresh block within the refresh threshold, return it immediately.
        if (this.lastGoodBlock && (now - this.lastGoodBlockTimestamp < this.refreshThreshold)) {
            return { 
                block: this.lastGoodBlock, 
                timestamp: this.lastGoodBlockTimestamp, 
                isStale: false 
            };
        }

        // 2. Single-flight Enforcement: If a refresh is already in progress, join it.
        if (this.activePromise) {
            return this.activePromise;
        }

        // 3. Initiate Refresh
        this.activePromise = (async () => {
            try {
                // 🛡️ [SLA] Enforcement of strict timeout for RPC sync
                const b = await this.withTimeout(provider.getBlockNumber(), 1500);
                const newBlock = Number(b);

                // 🛡️ [NO-DOWNGRADE] Protocol Enforcement
                // Prevent lagging or malicious RPCs from regressing system truth
                if (this.lastGoodBlock && newBlock < this.lastGoodBlock) {
                    console.warn(`[BLOCK_CACHE] 🛡️ Block regression detected (${newBlock} < ${this.lastGoodBlock}). Preserving higher truth.`);
                    return { 
                        block: this.lastGoodBlock, 
                        timestamp: this.lastGoodBlockTimestamp, 
                        isStale: true 
                    };
                }
                
                this.lastGoodBlock = newBlock;
                this.lastGoodBlockTimestamp = Date.now();
                
                return { 
                    block: this.lastGoodBlock, 
                    timestamp: this.lastGoodBlockTimestamp, 
                    isStale: false 
                };
            } catch (err) {
                console.warn(`[BLOCK_CACHE_FAIL] RPC sync failed. Falling back to last good block. Error: ${err.message}`);
                
                if (this.lastGoodBlock) {
                    return { 
                        block: this.lastGoodBlock, 
                        timestamp: this.lastGoodBlockTimestamp, 
                        isStale: true 
                    };
                }
                
                throw new Error("BLOCK_CACHE_FATAL: No previous good block available and RPC failed.");
            } finally {
                this.activePromise = null;
            }
        })();

        return this.activePromise;
    }

    withTimeout(promise, ms) {
        let timer;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("RPC_TIMEOUT")), ms);
        });
        return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
    }
}

// Export as Singleton
module.exports = new BlockCache();
