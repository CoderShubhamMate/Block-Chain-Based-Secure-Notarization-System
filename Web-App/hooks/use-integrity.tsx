/**
 * 🛡️ [RESILIENCE] useIntegrity Hook
 * Provides reactive access to the global Integrity Signal Processor.
 */

import { useState, useEffect } from 'react';
import { integrityStore, IntegrityState } from '@/lib/integrity-store';

export function useIntegrity() {
    const [state, setState] = useState<IntegrityState>(integrityStore.getState());

    useEffect(() => {
        // Subscribe to store updates
        const unsubscribe = integrityStore.subscribe((newState) => {
            setState(newState);
        });

        // Initialize with current state
        setState(integrityStore.getState());

        return unsubscribe;
    }, []);

    return {
        ...state,
        isHealthy: integrityStore.isHealthy(),
        isSlowSyncMode: state.failureCount >= 3
    };
}
