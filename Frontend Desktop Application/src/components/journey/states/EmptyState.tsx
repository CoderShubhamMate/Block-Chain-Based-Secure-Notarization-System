import React from "react";
import { JourneyReality } from "../../../state-machine/types";

interface Props {
    isClosing?: boolean;
    data?: JourneyReality | null;
}

/**
 * 🎨 EmptyState
 * Responsibility: Handle narrative closure and conversion CTAs.
 */
const EmptyState: React.FC<Props> = ({ isClosing, data }) => {
    const filename = data?.primary?.details?.filename;

    if (isClosing) {
        return (
            <div className="bg-white border-2 border-blue-500 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
                    <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Success Secured.</h2>
                <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
                    {filename 
                        ? `"${filename}" is now securely stored.` 
                        : "Your document is now securely stored."}
                </p>
                <div className="mt-8 flex justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 bg-slate-50/30 rounded-[2.5rem] p-12 text-center transition-all hover:bg-white hover:border-blue-400 hover:shadow-2xl group">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <span className="text-4xl group-hover:hidden transition-all">➕</span>
                <span className="text-4xl hidden group-hover:block transition-all">📂</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Ready to Secure?</h2>
            <p className="text-slate-500 mb-10 max-w-[240px] mx-auto text-xs font-bold leading-relaxed">
                Connect your next document to the blockchain. <br/>
                Our Trust Engine handles the rest.
            </p>

            <button 
                className="bg-slate-900 hover:bg-black text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center space-x-3 mx-auto group-hover:bg-blue-600 group-hover:shadow-blue-500/30"
                onClick={() => {
                   console.log("[ACTION] Opening Upload Modal");
                }}
            >
                <span>Upload Document</span>
                <span className="text-xl">➔</span>
            </button>
        </div>
    );
};

export default EmptyState;
