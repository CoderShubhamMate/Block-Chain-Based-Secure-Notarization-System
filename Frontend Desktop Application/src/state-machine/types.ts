/**
 * 🧩 State Machine Types
 * Responsibility: Hardened definitions for the Trust Engine states and payloads.
 */

export type AppState = 
    | 'BOOTSTRAP' 
    | 'LOADING' 
    | 'PRIMARY_FLOW' 
    | 'BLOCKING_ACTION' 
    | 'BACKGROUND' 
    | 'TERMINAL' 
    | 'EMPTY';

export interface JourneyFlow {
    flow_id: string;
    type: string;
    uxCode: string;
    perception: 'NORMAL' | 'SLOW' | 'DELAYED' | 'STALLED' | 'TERMINAL';
    action: string;
    priority: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    flow_step: 'UPLOAD' | 'PAYMENT' | 'VERIFY' | 'ASSIGN' | 'COMPLETE';
    is_blocking: boolean;
    can_dismiss: boolean;
    retry_allowed: boolean;
    retry_after: number | null;
    state: string;
    details: any;
}

export interface JourneyReality {
    primary: JourneyFlow | null;
    blocking: JourneyFlow | null;
    secondary: JourneyFlow[];
    meta: {
        snapshot_version: string;
        generated_at: string;
        consistency: 'STRONG' | 'EVENTUAL';
    };
}
