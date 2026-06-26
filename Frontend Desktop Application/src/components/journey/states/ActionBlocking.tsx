import React, { useState } from "react";
import { JourneyReality } from "../../../state-machine/types";

interface Props {
    data: JourneyReality;
    onAction: () => void;
    isProcessing: boolean;
    doubtMessage?: string | null;
}

/**
 * ⚡ ActionBlocking State
 * Responsibility: Zero-distraction UI with 3-Phase Interaction Loop.
 */
const ActionBlocking: React.FC<Props> = ({ data, onAction, isProcessing, doubtMessage }) => {
    const blocking = data.blocking!;
    const [localFeedback, setLocalFeedback] = useState(false);

    const handleAction = () => {
        if (isProcessing) return;
        
        // Phase 1: Instant Tactile Feedback (<16ms)
        setLocalFeedback(true);
        
        // Phase 2: System Request
        onAction();
        
        // Reset feedback after a short pulse
        setTimeout(() => setLocalFeedback(false), 400);
    };

    return (
        <div className={`transition-all duration-500 bg-white border-2 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto ${isProcessing ? 'border-blue-500 scale-[0.98]' : 'border-orange-500 scale-100'}`}>
            <div className="flex items-center space-x-5 mb-8">
                <div className={`w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center transition-transform ${isProcessing ? 'animate-pulse' : 'hover:rotate-12'}`}>
                    <span className="text-3xl text-orange-600">{isProcessing ? '⏳' : '⚡'}</span>
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Requirement Detected</h2>
                    <p className="text-sm text-slate-500 font-medium">To continue securing your document, please complete the step below.</p>
                </div>
            </div>

            <div className={`bg-slate-50 rounded-2xl p-5 mb-8 border transition-all ${isProcessing ? 'border-blue-100 opacity-60' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Flow Task</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black">
                        {blocking.flow_step}
                    </span>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-sm">📄</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 truncate">{blocking.details.filename}</p>
                    </div>

                    {blocking.details.amount && (
                        <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/20">
                            <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Fee Required</p>
                            <p className="text-xl font-black tracking-tight">{blocking.details.amount} NTKR</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reassurance Guard / Doubt Signal */}
            {doubtMessage ? (
                <div className="bg-blue-600 text-white p-3 rounded-xl mb-6 flex items-center space-x-3 animate-bounce-short shadow-lg shadow-blue-500/30">
                    <span className="text-lg">🛡️</span>
                    <p className="text-xs font-bold">{doubtMessage}</p>
                </div>
            ) : blocking.confidence !== 'HIGH' && (
                <div className={`border rounded-xl p-4 mb-6 flex items-start space-x-3 transition-all ${blocking.confidence === 'MEDIUM' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
                    <span className="text-xl">{blocking.confidence === 'MEDIUM' ? '⏳' : '⚠️'}</span>
                    <p className={`text-[11px] font-bold leading-relaxed ${blocking.confidence === 'MEDIUM' ? 'text-amber-900' : 'text-rose-900'}`}>
                        {blocking.confidence === 'MEDIUM' 
                            ? "Confirming details with the blockchain. Please process the request when ready." 
                            : "Heavy network load detected. Your action will be queued securely and retried automatically."}
                    </p>
                </div>
            )}

            <button 
                disabled={isProcessing}
                className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all relative overflow-hidden group ${
                    isProcessing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                }`}
                onClick={handleAction}
            >
                <span className={`transition-all duration-300 ${localFeedback || isProcessing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    {blocking.action === 'SIGN_PAYMENT' ? 'Complete Secure Payment' : 'Confirm & Secure Identity'}
                </span>
                
                {(localFeedback || isProcessing) && (
                    <div className="absolute inset-0 flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="ml-2 text-sm font-bold uppercase tracking-widest">{isProcessing ? 'Processing' : 'Received'}</span>
                    </div>
                )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center space-x-2">
                <span className="w-10 h-px bg-slate-200" />
                <span>Verified Blockchain Transaction</span>
                <span className="w-10 h-px bg-slate-200" />
            </p>

            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-short { animation: bounce-short 0.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default ActionBlocking;
