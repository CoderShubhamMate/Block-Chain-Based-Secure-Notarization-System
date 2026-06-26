import React, { useEffect, useState } from "react";

interface Props {
    onRetry: () => void;
    forcedMessage?: string;
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    retriesExhausted?: boolean;
}

/**
 * 🛠️ [MASTERED] TerminalFailure State
 * Responsibility: 3-Tier Emotional Escalation Ladder & Reactive Refresh Illusion.
 */
const TerminalFailure: React.FC<Props> = ({ onRetry, forcedMessage, confidence = 'MEDIUM', retriesExhausted = false }) => {
    const [elapsed, setElapsed] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshAt, setLastRefreshAt] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        onRetry();
        setTimeout(() => {
            setIsRefreshing(false);
            setLastRefreshAt(Date.now());
        }, 800);
    };

    // 🛡️ [PHASE 8.10] 3-Tier Emotional Escalation Ladder
    const getEscalation = () => {
        if (retriesExhausted || (elapsed > 90 && confidence === 'LOW')) {
            return {
                title: "System Synchronization Required",
                what: "We couldn’t confirm your request securely.",
                why: "A network timeout occurred during blockchain anchoring.",
                next: "No charges were made. You can safely retry or contact help.",
                cta: "Secure Retry Now",
                type: "CRITICAL"
            };
        }

        if (confidence === 'MEDIUM' || elapsed > 30) {
            return {
                title: "Just double-checking everything...",
                what: "Verification is taking longer than usual.",
                why: "Blockchain nodes are currently experiencing high volume.",
                next: "Your document is safe. You can wait or refresh to re-sync.",
                cta: "Check Status Now",
                type: "STALLED"
            };
        }

        return {
            title: "Taking a bit longer than usual...",
            what: "System is performing final security checks.",
            why: "Network latency is fluctuating slightly.",
            next: "Please stay on this screen while we anchor your data.",
            cta: "Wait for Update",
            type: "WAIT"
        };
    };

    const esc = getEscalation();

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 max-w-lg mx-auto text-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
            {/* Shimmer Overlay (Refresh Illusion) */}
            {isRefreshing && (
                <div className="absolute inset-0 bg-blue-50/40 backdrop-blur-[2px] z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Checking Reality...</span>
                    </div>
                </div>
            )}

            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-700 ${esc.type === 'CRITICAL' ? 'bg-rose-50' : 'bg-blue-50'} ${isRefreshing ? 'scale-90 opacity-50' : 'scale-100'}`}>
                <span className={`text-5xl transition-transform duration-700 ${isRefreshing ? 'rotate-180' : ''}`}>
                    {esc.type === 'CRITICAL' ? '🛑' : (esc.type === 'WAIT' ? '⏳' : '🛡️')}
                </span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                {esc.title}
            </h2>
            
            <div className="space-y-2 mb-10">
                <p className="text-sm font-bold text-slate-500 italic max-w-xs mx-auto">
                    {forcedMessage || esc.what}
                </p>
                <p className="text-xs text-slate-400 font-medium px-4">
                    {esc.next}
                </p>
            </div>

            <div className="space-y-6">
                {esc.type !== 'WAIT' ? (
                    <button 
                        disabled={isRefreshing}
                        className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 group relative overflow-hidden ${
                            esc.type === 'CRITICAL' 
                            ? 'bg-slate-900 text-white hover:bg-black' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={handleRefresh}
                    >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                            <span>{esc.cta}</span>
                            <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </span>
                    </button>
                ) : (
                    <div className="py-5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="flex items-center justify-center space-x-3 mb-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            Continuous Sync Active
                        </span>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        Last sync attempt: {new Date(lastRefreshAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold mt-1">
                        System Stall: {elapsed}s • Reliability: {confidence}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TerminalFailure;
