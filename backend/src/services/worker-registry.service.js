/**
 * 🛰️ [PHASE 6.2] Worker Health Registry
 * Responsibility: Track the liveness and performance of background services.
 * Invariant: Used to detect "Silent Death" in zero-trust workers.
 */
class WorkerRegistry {
    constructor() {
        this.workers = new Map();
    }

    /**
     * Update the heartbeat for a specific worker.
     */
    heartbeat(workerName, status = 'OK', metadata = {}) {
        this.workers.set(workerName, {
            status,
            lastSeen: new Date().toISOString(),
            metadata: {
                ...this.workers.get(workerName)?.metadata,
                ...metadata
            },
            errorCount: status === 'FAIL' ? (this.workers.get(workerName)?.errorCount || 0) + 1 : 0
        });
    }

    /**
     * Get the current health manifest for all registered workers.
     */
    getManifest() {
        const manifest = {};
        for (const [name, state] of this.workers.entries()) {
            manifest[name] = state;
        }
        return manifest;
    }
}

module.exports = new WorkerRegistry();
