import React from "react";
import { JourneyReality } from "../../../state-machine/types";

interface Props {
    data: JourneyReality;
}

/**
 * ⏳ ProcessBackground State
 * Responsibility: Calm status tracking with Emotional Microcopy and Narrative Bridges.
 */
const ProcessBackground: React.FC<Props> = ({ data }) => {
    const primary = data.primary!;
    const { perception, confidence, flow_step, details } = primary;

    const getStatusLabel = (step: string) => {
        switch (step) {
            case 'UPLOAD': return "Preparing your secure package...";
            case 'PAYMENT': return "Confirming your payment securely...";
            case 'VERIFY': return "Confirming it's really you... This may take a few moments.";
            case 'ASSIGN': return "Finding the right notary for you...";
            case 'CHAIN': return "Securing your document safely... Almost there.";
            case 'COMPLETE': return "All done. Your document is secured.";
            default: return "Taking another look at your request...";
        }
    };

    // 🛡️ [PHASE 8.10] Rhythmic Calibration
    // Slow down heartbeats and pulses when confidence is LOW
    const pulseClass = confidence === 'LOW' ? 'animate-pulse-slow' : 'animate-pulse';
    const bounceClass = confidence === 'LOW' ? 'animate-bounce-slow' : 'animate-bounce';

    return (
        <div className={`transition-all duration-1000 bg-white border border-blue-100 rounded-2xl p-6 max-w-lg mx-auto shadow-2xl ${confidence === 'LOW' ? 'px-8 py-10' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className={`w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-inner ${pulseClass}`}>
                            <span className="text-2xl transform hover:scale-110 transition-transform">🛡️</span>
                        </div>
                        {confidence === 'LOW' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">!</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                            {getStatusLabel(flow_step)}
                        </h3>
                        <p className="text-[10px] text-blue-500 uppercase font-black tracking-[0.2em] opacity-60">
                            Flow ID: {data.primary?.uid?.slice(0, 8) || 'Syncing...'}
                        </p>
                    </div>
                </div>
                
                <div className="flex space-x-1.5 opacity-40">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full bg-blue-400 ${bounceClass}`} style={{ animationDelay: `${i * 0.3}s` }}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {/* Document Anchor */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Document in Progress</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">Anchored</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 truncate mb-3">
                        {details.filename || "Untitled Document"}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`bg-blue-600 h-full rounded-full transition-all duration-[3000ms] ${confidence === 'LOW' ? 'opacity-50' : 'opacity-100'}`} style={{ width: '65%' }}></div>
                    </div>
                </div>

                {/* Narrative Bridge Layer */}
                <div className="flex items-center space-x-3 p-3 bg-blue-50/50 border border-blue-100/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <p className="text-[11px] text-blue-800 font-medium">
                        {perception === 'NORMAL' ? 'Everything looks good. We are handling the next steps.' : 'Just double-checking everything. This usually takes a bit longer.'}
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                    You can safely minimize this window. <br/>
                    We'll notify you as soon as the secure store is finalized.
                </p>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.98); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
                .animate-bounce-slow { animation: bounce-slow 1s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default ProcessBackground;
