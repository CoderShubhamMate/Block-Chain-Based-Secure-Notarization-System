import React, { useState } from "react";
import { JourneyReality } from "../../../state-machine/types";
import CertificateModal from "../../user/CertificateModal";

interface Props {
    data: JourneyReality;
}

/**
 * 🎉 RewardPrimary State
 * Responsibility: Celebrate success with Certainty Reinforcement and provide certificate access.
 */
const RewardPrimary: React.FC<Props> = ({ data }) => {
    const primary = data.primary!;
    const isSuccess = primary.priority >= 90;
    const [certOpen, setCertOpen] = useState(false);

    const txHash: string | null = primary.details?.tx_hash || null;
    const docId: string | number | null = primary.details?.doc_id || null;
    const filename: string = primary.details?.filename || primary.details?.title || "your document";
    const isNotarized = primary.details?.chain_confirmed ||
        primary.details?.submission_state === "completed" ||
        primary.details?.submission_state === "submitted_to_blockchain";

    return (
        <div className="bg-white border-2 border-blue-500 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(59,130,246,0.15)] p-12 max-w-xl mx-auto text-center relative overflow-hidden transition-all animate-in fade-in zoom-in duration-700">
            {/* Certainty Reinforcement Loop */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Verified on Blockchain</span>
            </div>

            <div className="mb-10 pt-4">
                <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto relative ${isSuccess ? 'bg-blue-600 shadow-xl shadow-blue-500/30' : 'bg-rose-100'}`}>
                    <span className="text-5xl">{isSuccess ? '✅' : '❌'}</span>
                    {isSuccess && (
                         <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center animate-bounce shadow-xl border-4 border-white rotate-12">
                            <span className="text-xl">✨</span>
                         </div>
                    )}
                </div>
            </div>

            <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                {isSuccess ? "Success. Secured." : "Action Failed"}
            </h1>
            
            <p className="text-sm font-bold text-slate-500 mb-10 max-w-xs mx-auto leading-relaxed">
                {isSuccess 
                    ? `The notarization for "${filename}" is now safely stored and verified.` 
                    : `We couldn't finalize the security anchor for your document.`}
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Fingerprint</span>
                        <span className="text-xs font-mono text-blue-600 font-bold truncate max-w-[180px]" title={txHash || ""}>
                            {txHash ? `${txHash.slice(0, 12)}...${txHash.slice(-8)}` : "Pending"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</span>
                        <div className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-xs font-black text-slate-800">Immutable Hash Recorded</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                {isNotarized && docId ? (
                    <button 
                        onClick={() => setCertOpen(true)}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3"
                    >
                        <span>View Public Certificate</span>
                        <span className="text-xl">➔</span>
                    </button>
                ) : (
                    <button 
                        disabled
                        className="w-full bg-slate-300 text-slate-500 font-black py-5 rounded-2xl shadow-sm cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                        <span>Certificate Pending...</span>
                    </button>
                )}
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Saved securely • Verified on blockchain
                </p>
            </div>

            {/* Certificate Modal */}
            {docId && (
                <CertificateModal
                    open={certOpen}
                    onClose={() => setCertOpen(false)}
                    docId={docId}
                    docTitle={filename}
                />
            )}
        </div>
    );
};

export default RewardPrimary;
