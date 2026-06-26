import React, { useState, useEffect } from "react";
import { Shield, Copy, ExternalLink, CheckCircle, Loader2, XCircle, Hash, FileCheck, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import api from "../../services/api";

interface CertificateData {
    document_id: number;
    filename: string;
    title: string;
    file_hash: string;
    submission_state: string;
    chain_confirmed: boolean;
    approval_tx_hash: string | null;
    notarized_at: string;
    notary_wallet: string | null;
    notary_name: string | null;
    contract_address: string;
    chain_id: number;
    block_explorer_url: string | null;
    contract_explorer_url: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    docId: string | number;
    docTitle?: string;
}

const CertificateModal: React.FC<Props> = ({ open, onClose, docId, docTitle }) => {
    const [cert, setCert] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !docId) return;
        setLoading(true);
        setError(null);
        setCert(null);

        api.getCertificate(docId)
            .then(setCert)
            .catch((err: any) => setError(err.message || "Failed to load certificate"))
            .finally(() => setLoading(false));
    }, [open, docId]);

    const copyToClipboard = (value: string, key: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const truncate = (str: string, head = 10, tail = 8) =>
        str ? `${str.slice(0, head)}...${str.slice(-tail)}` : "N/A";

    const Row = ({ label, value, copyKey, mono = false }: { label: string; value: string | null; copyKey?: string; mono?: boolean }) => (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] shrink-0 pt-0.5">{label}</span>
            <div className="flex items-center gap-2 text-right">
                <span className={`text-sm text-slate-800 font-medium break-all ${mono ? "font-mono text-[11px]" : ""}`}>
                    {value || "N/A"}
                </span>
                {copyKey && value && (
                    <button
                        onClick={() => copyToClipboard(value, copyKey)}
                        className="shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                        title="Copy"
                    >
                        {copied === copyKey
                            ? <CheckCircle size={14} className="text-emerald-500" />
                            : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-white border-0 shadow-2xl rounded-3xl max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <FileCheck size={22} className="text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white text-[17px] font-black tracking-tight">
                                    Notarization Certificate
                                </DialogTitle>
                                <p className="text-blue-200 text-[11px] font-bold uppercase tracking-[0.15em] mt-0.5">
                                    Blockchain-Verified Proof
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-8 py-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Loading Certificate...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                                <XCircle size={22} className="text-red-500" />
                            </div>
                            <p className="text-sm font-bold text-red-600">{error}</p>
                        </div>
                    )}

                    {cert && !loading && (
                        <>
                            {/* Status Badge */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-full">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em]">
                                        {cert.chain_confirmed ? "Confirmed On-Chain" : "Submitted to Blockchain"}
                                    </span>
                                </div>
                            </div>

                            {/* Document Section */}
                            <div className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Document Identity</span>
                                </div>
                                <Row label="Document" value={cert.title || cert.filename} />
                                <Row
                                    label="File Hash (SHA-256)"
                                    value={truncate(cert.file_hash, 12, 10)}
                                    copyKey="file_hash"
                                    mono
                                />
                            </div>

                            {/* Blockchain Proof Section */}
                            <div className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Hash size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">On-Chain Proof</span>
                                </div>
                                <Row
                                    label="Transaction Hash"
                                    value={cert.approval_tx_hash ? truncate(cert.approval_tx_hash, 12, 10) : "Pending"}
                                    copyKey="tx_hash"
                                    mono
                                />
                                <Row
                                    label="Registry Contract"
                                    value={truncate(cert.contract_address, 12, 10)}
                                    copyKey="contract"
                                    mono
                                />
                                <Row label="Network (Chain ID)" value={`BSC ${cert.chain_id === 56 ? "Mainnet" : "Testnet"} (${cert.chain_id})`} />
                            </div>

                            {/* Notary Section */}
                            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <User size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Notary Details</span>
                                </div>
                                {cert.notary_name && <Row label="Notary Name" value={cert.notary_name} />}
                                <Row
                                    label="Notary Wallet"
                                    value={cert.notary_wallet ? truncate(cert.notary_wallet, 10, 8) : "N/A"}
                                    copyKey="notary_wallet"
                                    mono
                                />
                                <div className="flex items-center gap-2 pt-3">
                                    <Clock size={12} className="text-slate-400 shrink-0" />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        Notarized on {cert.notarized_at ? new Date(cert.notarized_at).toLocaleString() : "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                {cert.block_explorer_url && (
                                    <a
                                        href={cert.block_explorer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 text-[13px] uppercase tracking-wide"
                                    >
                                        <ExternalLink size={16} />
                                        Verify Transaction on BscScan
                                    </a>
                                )}
                                <a
                                    href={cert.contract_explorer_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3.5 rounded-2xl transition-all text-[12px] uppercase tracking-wide border border-slate-200"
                                >
                                    <ExternalLink size={14} />
                                    View Registry Contract
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CertificateModal;
