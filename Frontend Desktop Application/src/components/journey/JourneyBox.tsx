import React from "react";
import { useUserState } from "../../hooks/useUserState";
import RewardPrimary from "./states/RewardPrimary";
import ActionBlocking from "./states/ActionBlocking";
import ProcessBackground from "./states/ProcessBackground";
import TerminalFailure from "./states/TerminalFailure";
import EmptyState from "./states/EmptyState";
import SkeletonJourney from "./states/SkeletonJourney";

/**
 * 🖼️ JourneyBox (The Switcher)
 * Responsibility: Mount the correct UI layer and orchestrate trust signals.
 */
const JourneyBox: React.FC = () => {
    const { 
        data, 
        appState, 
        retry, 
        isRetrying, 
        isClosing, 
        doubtMessage, 
        confidence, 
    } = useUserState();

    // 🛡️ [PHASE_8.10] Professional Skeleton Boundary
    if (appState === "BOOTSTRAP" || appState === "LOADING") {
        return <SkeletonJourney />;
    }

    switch (appState) {
        case "PRIMARY_FLOW":
            return <RewardPrimary data={data!} />;

        case "BLOCKING_ACTION":
            return (
                <ActionBlocking 
                    data={data!} 
                    onAction={retry} 
                    isProcessing={isRetrying}
                    doubtMessage={doubtMessage}
                />
            );

        case "BACKGROUND":
            return <ProcessBackground data={data!} />;

        case "TERMINAL":
            return (
                <TerminalFailure 
                    onRetry={retry} 
                    confidence={confidence as 'HIGH'|'MEDIUM'|'LOW'}
                    retriesExhausted={data?.primary?.perception === 'STALLED'}
                />
            );

        case "EMPTY":
            return <EmptyState isClosing={isClosing} data={data} />;

        default:
            return null;
    }
};

export default JourneyBox;
