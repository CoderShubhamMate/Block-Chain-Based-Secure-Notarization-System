import { ExternalLink, Hash, User, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface DocumentMetadataProps {
    document: any;
    onClose: () => void;
}

export function DocumentMetadata({ document, onClose }: DocumentMetadataProps) {
    const getBSCScanLink = (txHash: string) => {
        return `https://testnet.bscscan.com/tx/${txHash}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-[#0A2540] border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-100">Document Metadata</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-200"
                        >
                            Close
                        </Button>
                    </div>

                    {/* Document Info */}
                    <div className="space-y-4">
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="text-blue-400" size={18} />
                                <p className="text-sm text-gray-400">Filename</p>
                            </div>
                            <p className="text-gray-200">{document.filename}</p>
                        </div>

                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Hash className="text-emerald-400" size={18} />
                                <p className="text-sm text-gray-400">File Hash</p>
                            </div>
                            <p className="text-xs text-gray-300 font-mono break-all selectable">{document.file_hash}</p>
                        </div>

                        {/* Status */}
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {document.status === 'approved' ? (
                                    <CheckCircle className="text-emerald-400" size={18} />
                                ) : document.status === 'rejected' ? (
                                    <XCircle className="text-red-400" size={18} />
                                ) : (
                                    <FileText className="text-yellow-400" size={18} />
                                )}
                                <p className="text-sm text-gray-400">Status</p>
                            </div>
                            <Badge className={getStatusColor(document.status)}>
                                {document.status.toUpperCase()}
                            </Badge>
                        </div>

                        {/* On-chain Transaction Hash */}
                        {document.approval_tx_hash && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash className="text-emerald-400" size={18} />
                                    <p className="text-sm text-emerald-400">Blockchain Transaction</p>
                                </div>
                                <p className="text-xs text-gray-300 font-mono break-all mb-3 selectable">
                                    {document.approval_tx_hash}
                                </p>
                                <a
                                    href={getBSCScanLink(document.approval_tx_hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                                >
                                    View on BSCScan
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        )}

                        {/* Document Summary (if approved) */}
                        {document.status === 'approved' && document.document_summary && (
                            <div className="bg-gray-900/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="text-blue-400" size={18} />
                                    <p className="text-sm text-gray-400">Document Summary</p>
                                </div>
                                <p className="text-gray-300 whitespace-pre-wrap">{document.document_summary}</p>
                            </div>
                        )}

                        {/* Rejection Reason (if rejected) */}
                        {document.status === 'rejected' && document.rejection_reason && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="text-red-400" size={18} />
                                    <p className="text-sm text-red-400">Rejection Reason</p>
                                </div>
                                <p className="text-gray-300 whitespace-pre-wrap">{document.rejection_reason}</p>
                            </div>
                        )}

                        {/* Notary Info */}
                        {document.notary_id && (
                            <div className="bg-gray-900/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="text-purple-400" size={18} />
                                    <p className="text-sm text-gray-400">Processed By</p>
                                </div>
                                <p className="text-gray-300">Notary ID: {document.notary_id}</p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="text-gray-400" size={18} />
                                    <p className="text-xs text-gray-400">Created</p>
                                </div>
                                <p className="text-sm text-gray-300">
                                    {new Date(document.created_at).toLocaleString()}
                                </p>
                            </div>
                            {document.updated_at && (
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="text-gray-400" size={18} />
                                        <p className="text-xs text-gray-400">Updated</p>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        {new Date(document.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
