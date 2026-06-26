/**
 * 🛡️ [AUTHORITATIVE] System Recovery & Persistence Policy
 * Responsibility: Defines the tiered retry budgets and cooldown windows for the Reality Engine.
 */

const RECOVERY_POLICY = {
    // ⛓️ CLASS 1: Deterministic External Systems (Blockchain)
    // Goal: High persistence handles RPC lags and chain sync delays.
    CHAIN: {
        MAX_RETRIES: 7,
        COOLDOWN_MS: 30000,         // 30s Wait between auto-healing attempts
        WINDOW_RESET_MS: 300000,    // 5m  Window before reseting retry count
        MAX_CYCLES: 3               // After 3 window resets, it's a FAILURE
    },

    // 🤝 CLASS 2: Internal Async Logic (Notary Assignment)
    // Goal: Moderate persistence for logic that depends on system state/notary availability.
    ASSIGNMENT: {
        MAX_RETRIES: 3,
        COOLDOWN_MS: 60000,         // 1m  Wait
        WINDOW_RESET_MS: 600000,    // 10m Window
        MAX_CYCLES: 2
    },

    // 👤 CLASS 3: User-Dependent Actions (Payments / Signatures)
    // Goal: No auto-healing. System cannot resolve human actions.
    USER_ACTION: {
        MAX_RETRIES: 0,
        COOLDOWN_MS: 0,
        WINDOW_RESET_MS: 0,
        MAX_CYCLES: 0
    }
};

module.exports = RECOVERY_POLICY;
