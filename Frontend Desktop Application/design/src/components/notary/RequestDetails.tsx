import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZoomIn, ZoomOut, FileText, Image as ImageIcon, User, Wallet, Hash, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface RequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

export function RequestDetails({ requestId, onBack }: RequestDetailsProps) {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [transcription, setTranscription] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
  }>({ open: false, action: null });

  useEffect(() => {
    // Notify Java bridge about navigation
    if (window.javaBridge) {
      window.javaBridge.onNavigateBack();
    }
  }, []);

  // Mock data
  const request = {
    id: requestId,
    fileType: "Image",
    client: {
      name: "Alice Cooper",
      nationalId: "ID-2024-5678",
      wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    },
    fileHash: "8f2e9a1c4b3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
    timestamp: "2024-10-16 14:32:15",
    status: "Pending",
  };

  const handleBack = () => {
    onBack();
    navigate(-1); // Use browser back navigation
  };

  const handleAction = (action: "approve" | "reject") => {
    setConfirmDialog({ open: true, action });
  };

  const confirmAction = () => {
    // Process the action
    setConfirmDialog({ open: false, action: null });
    handleBack();
  };

  return (
    <div className="flex-1 bg-[#0D1B2A] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540]">
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-200 -ml-2"
              >
                ← Back
              </Button>
              <h1 className="text-gray-100">Request Details</h1>
            </div>
            <p className="text-sm text-gray-400">Review and process notarization request</p>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {request.status}
          </Badge>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document Viewer */}
        <div className="flex-1 border-r border-gray-800 flex flex-col">
          <div className="border-b border-gray-800 bg-[#0A2540] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {request.fileType === "PDF" ? (
                <FileText className="text-blue-400" size={20} />
              ) : (
                <ImageIcon className="text-purple-400" size={20} />
              )}
              <span className="text-gray-300">File Type: {request.fileType}</span>
            </div>

            {request.fileType === "Image" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-gray-400 w-12 text-center">{zoom}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-gray-900/30 p-8 flex items-center justify-center">
            {request.fileType === "Image" ? (
              <div className="relative">
                <div
                  className="bg-white rounded-lg shadow-2xl overflow-hidden"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
                >
                  {/* Placeholder image */}
                  <div className="w-[600px] h-[800px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Sample Document Image</p>
                      <p className="text-sm text-gray-400 mt-2">Birth Certificate</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-8">
                <div className="space-y-4 text-gray-800">
                  <h2 className="border-b pb-2">Sample PDF Document</h2>
                  <p>This is a preview of the PDF document submitted for notarization.</p>
                  <div className="bg-gray-100 p-4 rounded">
                    <p className="text-sm">Document content would be displayed here...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {request.fileType === "Image" && (
            <div className="border-t border-gray-800 bg-[#0A2540] p-4">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <ImageIcon size={14} />
                Manual transcription required for image files
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Information & Actions */}
        <div className="w-96 bg-[#0A2540] flex flex-col overflow-auto">
          <div className="p-6 space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="text-gray-100 mb-4 flex items-center gap-2">
                <User size={18} className="text-emerald-400" />
                Client Information
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm text-gray-200">{request.client.name}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">National ID</p>
                  <p className="text-sm text-gray-200 font-mono">{request.client.nationalId}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <p className="text-xs text-gray-200 font-mono break-all">{request.client.wallet}</p>
                </div>
              </div>
            </div>

            {/* Transcription Area */}
            {request.fileType === "Image" && (
              <div>
                <h3 className="text-gray-100 mb-3">Transcription / Notes</h3>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Enter document transcription or notes here..."
                  className="bg-gray-900/50 border-gray-800 text-gray-100 min-h-[200px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Transcribe the content from the image for verification
                </p>
              </div>
            )}

            {/* File Hash */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="text-emerald-400" size={16} />
                <p className="text-xs text-emerald-400">File Hash Generated</p>
              </div>
              <p className="text-xs text-gray-400 font-mono break-all">{request.fileHash}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleAction("approve")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11"
              >
                <CheckCircle size={16} className="mr-2" />
                Approve Request
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 rounded-xl h-11"
              >
                <XCircle size={16} className="mr-2" />
                Reject Request
              </Button>
            </div>
          </div>

          {/* Status Footer */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>File Hash Generated</span>
              <span className="text-yellow-400">Blockchain: Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>
              Confirm {confirmDialog.action === "approve" ? "Approval" : "Rejection"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to {confirmDialog.action} request <span className="text-emerald-400">{requestId}</span>?
              {confirmDialog.action === "approve" && " This will be recorded on the blockchain."}
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.action === "approve" && request.fileType === "Image" && !transcription && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <p className="text-xs text-yellow-300">
                ⚠️ No transcription provided. Consider adding transcription for image-based documents.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDialog({ open: false, action: null })}
              className="text-gray-400 hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={
                confirmDialog.action === "approve"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
