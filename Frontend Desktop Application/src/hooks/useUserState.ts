import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/api";
import { AppState, JourneyReality } from "../state-machine/types";
import { resolveAppState } from "../state-machine/resolver";

/**
 * 🛡️ [TRUST ENGINE] useUserState Hook (Production Lock v8.10)
 * Responsibility: Deterministic timing, Hybrid locks, Narrative continuity, and Doubt detection.
 */

const BASE_TIMING = {
    MICRO: 400,    // Tactile feedback & Acknowledgement
    ACTION: 700,   // Transition & Logic bridges
    OUTCOME: 1500, // Success hold & Result stability
};

const MAX_LOCK_MS = 8000;
const DOUBT_COOLDOWN_MS = 10000;
const IDLE_HEARTBEAT_MS = 15000;
const CLEANUP_GRACE_MS = 5000;

export function useUserState() {
    const [data, setData] = useState<JourneyReality | null>(null);
    const [appState, setAppState] = useState<AppState>("BOOTSTRAP");
    
    // Perception states
    const [isRetrying, setIsRetrying] = useState(false);
    const [isBridging, setIsBridging] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [doubtMessage, setDoubtMessage] = useState<string | null>(null);

    const requestIdRef = useRef(0);
    const appStateRef = useRef<AppState>("BOOTSTRAP");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    
    // 🛡️ [LOCK] Hybrid Interaction Guard
    const interactionLockRef = useRef<number>(0);
    const isRequestingRef = useRef(false);
    
    // 🛡️ [MEMORY] Narrative Consistency
    const stepMemoryRef = useRef<Map<string, number>>(new Map()); // flowId -> maxStep
    const lastDoubtShownRef = useRef<number>(0);
    const lastSwitchRef = useRef(Date.now());
    const lastDataFlowIdRef = useRef<string | null>(null);

    // Update state ref for async access
    useEffect(() => {
        appStateRef.current = appState;
    }, [appState]);

    const FLOW_ORDER = ['UPLOAD', 'PAYMENT', 'VERIFY', 'ASSIGN', 'COMPLETE'];

    const getInterval = (perception?: string, confidence?: string) => {
        if (confidence === 'LOW') return 15000;
        switch (perception) {
            case "NORMAL": return 5000;
            case "SLOW": return 8000;
            case "DELAYED": return 12000;
            case "STALLED": return null;
            default: return 5000;
        }
    };

    const isMajorTransition = (prev: AppState, next: AppState) => {
        // Enters Terminal or Success
        if (next === 'TERMINAL' || next === 'PRIMARY_FLOW') return true;
        // Enters Blocking from Non-Blocking
        if (next === 'BLOCKING_ACTION' && prev !== 'BLOCKING_ACTION') return true;
        return false;
    };

    const fetchState = useCallback(async (isManualRetry = false) => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        const current = ++requestIdRef.current;
        isRequestingRef.current = true;
        
        try {
            const res = await api.request("/api/user/state");
            if (current !== requestIdRef.current) return;

            const nextData = res as JourneyReality;
            const nextState = resolveAppState(nextData);
            const flowId = nextData.primary?.uid || 'global';
            const currentStep = nextData.primary?.flow_step || 'UPLOAD';
            const nextStepIdx = FLOW_ORDER.indexOf(currentStep);

            // 🛡️ [GUARD] Narrative Regression Protection (Per Flow)
            const maxIdx = stepMemoryRef.current.get(flowId) || -1;
            const isRegression = nextStepIdx < maxIdx;

            if (isRegression && nextData.primary?.reason !== 'USER_ACTION_REQUIRED') {
                // Suppress noise regression, keep highest known state
                scheduleNext(nextData);
                return;
            }
            if (nextStepIdx > maxIdx) {
                stepMemoryRef.current.set(flowId, nextStepIdx);
            }

            const now = Date.now();
            const timeSinceLastSwitch = now - lastSwitchRef.current;
            const isMajor = isMajorTransition(appStateRef.current, nextState);

            // 🛡️ [TIMING] Determination vs Stability
            const shouldTransition = isMajor || (appStateRef.current !== nextState && timeSinceLastSwitch >= BASE_TIMING.OUTCOME);

            if (shouldTransition) {
                if (appStateRef.current === 'PRIMARY_FLOW' && nextState === 'EMPTY') {
                    // Narrative Closure Signal
                    setIsClosing(true);
                    setTimeout(() => {
                        setIsClosing(false);
                        setData(null);
                        setAppState("EMPTY");
                    }, 800);
                    return;
                }

                setAppState("LOADING");
                setTimeout(() => {
                    setData(nextData);
                    setAppState(nextState);
                    lastSwitchRef.current = Date.now();
                    lastDataFlowIdRef.current = flowId;
                    setIsRetrying(false);
                }, BASE_TIMING.ACTION / 2);
            } else {
                // Noise suppression for intermediate counts in low-confidence
                if (nextData.primary?.confidence !== 'LOW' || isMajor) {
                    setData(nextData);
                }
            }

            scheduleNext(nextData);

        } catch (err: any) {
            if (err.name === 'AbortError') return;
            // Emotional sub-pause before terminal slap
            setTimeout(() => setAppState("TERMINAL"), 300);
        } finally {
            isRequestingRef.current = false;
        }
    }, [appState]);

    const scheduleNext = (journeyData: JourneyReality) => {
        const interval = getInterval(journeyData.primary?.perception, journeyData.primary?.confidence);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (interval === null) return;
        timerRef.current = setTimeout(() => fetchState(), interval);
    };

    const retry = useCallback(() => {
        const now = Date.now();
        // 🛡️ [LOCK] Hybrid Safety (max(1000ms, until_resolved) with hard fallback)
        const timeSinceLock = now - interactionLockRef.current;
        if (isRequestingRef.current || (timeSinceLock < 1000 && interactionLockRef.current !== 0)) {
            // Absorb chaos
            if (now - lastDoubtShownRef.current > DOUBT_COOLDOWN_MS) {
                setDoubtMessage("We're already working on it...");
                lastDoubtShownRef.current = now;
                setTimeout(() => setDoubtMessage(null), 3000);
            }
            return;
        }

        interactionLockRef.current = now;
        setIsRetrying(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        
        requestIdRef.current++; 
        fetchState(true);

        // Safety fallback to prevent permanent deadlock
        setTimeout(() => { isRequestingRef.current = false; }, MAX_LOCK_MS);
    }, [fetchState]);

    useEffect(() => {
        fetchState();
        return () => {
            controllerRef.current?.abort();
            if (timerRef.current) clearTimeout(timerRef.current);
            stepMemoryRef.current.clear(); // Session reset safety
        };
    }, []);

    return { 
        data, 
        appState, 
        retry,
        isRetrying,
        isBridging,
        isClosing,
        doubtMessage,
        confidence: data?.primary?.confidence || 'HIGH',
        flowId: data?.primary?.uid || lastDataFlowIdRef.current
    };
}
