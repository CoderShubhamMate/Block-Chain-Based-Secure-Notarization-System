import React, { Component, ErrorInfo, ReactNode } from "react";
import TerminalFailure from "../journey/states/TerminalFailure";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * 🛡️ [RESILIENCE] JourneyErrorBoundary
 * Responsibility: Prevent JourneyBox crashes from taking down the App.
 * Provides: Recovery path (Reload State).
 */
class JourneyErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[JOURNEY_CRITICAL_UI_CRASH]", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Force a system reload by refreshing the window if necessary
        // or just rely on state reset.
        window.location.reload(); 
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50/20 backdrop-blur-sm rounded-3xl border border-red-500/10">
                    <TerminalFailure 
                        onRetry={this.handleReset}
                        forcedMessage="Security Interface Error: The trust engine encountered a runtime exception. Your documents remain safe." 
                    />
                </div>
            );
        }

        return this.children;
    }
}

export default JourneyErrorBoundary;
