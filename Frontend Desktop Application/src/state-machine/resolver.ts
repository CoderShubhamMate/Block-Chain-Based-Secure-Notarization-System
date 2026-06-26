import { AppState, JourneyReality } from './types';

/**
 * 🧠 Authoritative State Resolver
 * Responsibility: Map backend "Truth" to frontend "Trust" states.
 * Logic: Priority Resolution (Blocking > Reward/Failure > Background > Empty)
 */
export function resolveAppState(data: JourneyReality | null): AppState {
    if (!data) return 'EMPTY';

    // 1. BLOCKING_ACTION (Highest Urgency)
    if (data.blocking) {
        return 'BLOCKING_ACTION';
    }

    // 2. PRIMARY_FLOW (Highest Impact Outcomes)
    if (data.primary) {
        // We only show PRIMARY_FLOW screen if it is a terminal reward or a major failure
        // Priority >= 90 as per backend scorer.js (REWARD=100, CRITICAL=90)
        if (data.primary.priority >= 90) {
            return 'PRIMARY_FLOW';
        }
        
        // Background flows (processing, waiting)
        return 'BACKGROUND';
    }

    // 3. DEFAULT
    return 'EMPTY';
}
