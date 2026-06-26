/**
 * 🛡️ [RESILIENCE] Integrity Signal Processor
 * Sole Source of Truth for frontend blockchain integrity state.
 * Implements: Event-based processing, Timestamp Guards, Priority Resolution.
 */

export type SecurityContext = {
    env: 'VERIFIED' | 'DEGRADED' | 'UNKNOWN';
    capability: string;
    integrity: 'HIGH' | 'LOW';
    stale: boolean;
    timestamp: number;
};

export type IntegrityEvent = 
    | { type: 'STRONG_RESPONSE'; ctx: SecurityContext; ts: number }
    | { type: 'STALE_RESPONSE'; ctx: SecurityContext; ts: number }
    | { type: 'FAILURE_426'; ts: number }
    | { type: 'FAILURE_OTHER'; ts: number };

export interface IntegrityState {
    isIntegrityCompromised: boolean;
    isStale: boolean;
    failureCount: number;
    lastUpdate: number;
    lastStrongTs: number;
    lastFailureTs: number;
}

class IntegrityStore {
    private state: IntegrityState = {
        isIntegrityCompromised: false,
        isStale: false,
        failureCount: 0,
        lastUpdate: 0,
        lastStrongTs: 0,
        lastFailureTs: 0
    };

    private subscribers: Set<(state: IntegrityState) => void> = new Set();
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DECAY_THRESHOLD_MS = 30000; // 30s failure decay
    private readonly DEBOUNCE_MS = 200;

    constructor() {
        // Initialization mirror for debug
        if (typeof window !== 'undefined') {
            (window as any).__BBSNS_INTEGRITY_STORE__ = this;
        }
    }

    /**
     * Determine if a response is "Strong" (Verified + Fresh)
     */
    private isStrong(ctx: SecurityContext): boolean {
        return ctx.env === 'VERIFIED' && !ctx.stale;
    }

    /**
     * 🛡️ processEvent() - The Ground-Truth Signal Processor
     * Implements Priority: STRONG > STALE > FAILURE
     */
    public processEvent(event: IntegrityEvent) {
        const now = Date.now();

        // 1. Timestamp Guard: Ignore out-of-order signals
        if (event.ts < this.state.lastUpdate) {
            console.warn(`[INTEGRITY_STORE] Discarding stale event (${event.ts} < ${this.state.lastUpdate})`);
            return;
        }

        // 2. Failure Decay: Reset failure count if last failure was > 30s ago
        if (this.state.lastFailureTs > 0 && now - this.state.lastFailureTs > this.DECAY_THRESHOLD_MS) {
            this.state.failureCount = 0;
            console.log("[INTEGRITY_STORE] Failure decay triggered. Resetting counters.");
        }

        switch (event.type) {
            case 'STRONG_RESPONSE':
                if (this.isStrong(event.ctx)) {
                    this.state.isIntegrityCompromised = false;
                    this.state.isStale = false;
                    this.state.failureCount = 0;
                    this.state.lastStrongTs = event.ts;
                    this.state.lastUpdate = event.ts;
                }
                break;

            case 'STALE_RESPONSE':
                // Only mark stale if it doesn't contradict a newer STRONG response
                if (event.ts > this.state.lastStrongTs) {
                    this.state.isStale = true;
                    this.state.lastUpdate = event.ts;
                }
                break;

            case 'FAILURE_426':
                this.state.isIntegrityCompromised = true;
                this.state.failureCount++;
                this.state.lastFailureTs = event.ts;
                this.state.lastUpdate = event.ts;
                break;

            case 'FAILURE_OTHER':
                this.state.lastUpdate = event.ts;
                break;
        }

        this.emitChange();
    }

    /**
     * Bump failure count for external loop detection
     */
    public bumpFailure() {
        this.state.failureCount++;
        this.state.lastFailureTs = Date.now();
        this.emitChange();
    }

    /**
     * Reactive interface for components
     */
    public getState(): IntegrityState {
        return { ...this.state };
    }

    public isHealthy(): boolean {
        const now = Date.now();
        return !this.state.isIntegrityCompromised && (now - this.state.lastStrongTs < this.DECAY_THRESHOLD_MS);
    }

    public subscribe(callback: (state: IntegrityState) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private emitChange() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            this.subscribers.forEach(cb => cb({ ...this.state }));
            
            // Debug Mirror update
            if (typeof window !== 'undefined') {
                (window as any).__BBSNS_SECURITY__ = {
                    ...this.state,
                    ts: Date.now()
                };
            }
        }, this.DEBOUNCE_MS);
    }
}

export const integrityStore = new IntegrityStore();
export default integrityStore;
