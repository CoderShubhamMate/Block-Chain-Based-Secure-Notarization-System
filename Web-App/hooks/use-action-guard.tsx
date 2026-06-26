/**
 * 🛡️ [RESILIENCE] useActionGuard Hook
 * Enforces tiered security policies for frontend actions based on integrity signals.
 */

import { useIntegrity } from './use-integrity';

export type ActionSecurityStatus = 
    | { ok: true; warn?: string }
    | { ok: false; reason: 'INTEGRITY_UNSTABLE' | 'STALE_DATA' | 'AUTH_REQUIRED' };

export function useActionGuard() {
    const { isIntegrityCompromised, isStale } = useIntegrity();

    return {
        /**
         * Guard for High-Risk Actions (e.g., Upload, Notarize, Vote)
         * - BLOCKS if integrity is compromised (426 errors).
         * - WARNS if data is stale.
         */
        canRunHigh(): ActionSecurityStatus {
            if (isIntegrityCompromised) {
                return { 
                    ok: false, 
                    reason: 'INTEGRITY_UNSTABLE' 
                };
            }
            if (isStale) {
                return { 
                    ok: true, 
                    warn: 'STALE_DATA' 
                };
            }
            return { ok: true };
        },

        /**
         * Guard for Medium-Risk Actions (e.g., Refresh, Minor Configs)
         * - WARNS if data is stale.
         * - ALLOWS if integrity is compromised (unless it requires auth).
         */
        canRunMedium(): ActionSecurityStatus {
            if (isStale) {
                return { 
                    ok: true, 
                    warn: 'STALE_DATA' 
                };
            }
            return { ok: true };
        }
    };
}
