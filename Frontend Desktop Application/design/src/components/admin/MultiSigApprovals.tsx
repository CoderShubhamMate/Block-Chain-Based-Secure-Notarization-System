import { useState } from "react";
import { CheckCircle, XCircle, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const mockTransactions = [
  {
    id: "TX-2024-001",
    type: "Notary Approval",
    status: "Pending",
    signatures: "2/3",
    description: "Approve notary: John Smith (NT-2024-001)",
    initiator: "Admin A",
    timestamp: "2024-10-16 14:30:00",
  },
  {
    id: "TX-2024-002",
    type: "System Update",
    status: "Approved",
    signatures: "3/3",
    description: "Deploy contract update v2.1.0",
    initiator: "Admin B",
    timestamp: "2024-10-16 12:15:00",
  },
  {
    id: "TX-2024-003",
    type: "Revoke Notary",
    status: "Pending",
    signatures: "1/3",
    description: "Revoke notary: Alice Johnson (NT-2024-004)",
    initiator: "Admin C",
    timestamp: "2024-10-16 11:00:00",
  },
  {
    id: "TX-2024-004",
    type: "Fund Transfer",
    status: "Rejected",
    signatures: "0/3",
    description: "Transfer 5 ETH to contract wallet",
    initiator: "Admin A",
    timestamp: "2024-10-16 09:45:00",
  },
];

export function MultiSigApprovals() {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    transaction: typeof mockTransactions[0] | null;
  }>({ open: false, action: "", transaction: null });

  const handleAction = (action: string, transaction: typeof mockTransactions[0]) => {
    setConfirmDialog({ open: true, action, transaction });
  };

  const confirmAction = () => {
    // Handle the blockchain transaction here
    setConfirmDialog({ open: false, action: "", transaction: null });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      "Notary Approval": "bg-blue-500/20 text-blue-400",
      "System Update": "bg-purple-500/20 text-purple-400",
      "Revoke Notary": "bg-orange-500/20 text-orange-400",
      "Fund Transfer": "bg-cyan-500/20 text-cyan-400",
    };
    return (
      <Badge className={variants[type as keyof typeof variants] || "bg-gray-500/20 text-gray-400"}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-400" size={24} />
            <h1 className="text-gray-100">Multi-Signature Approvals</h1>
          </div>
          <p className="text-sm text-gray-400">Approve or reject critical system transactions</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Shield className="text-blue-400 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-blue-300 mb-1">Multi-Signature Security</p>
            <p className="text-xs text-blue-300/70">
              Critical operations require 3 out of 5 admin approvals to execute on the blockchain.
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Transaction ID</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Description</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Signatures</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-gray-300 font-mono text-sm">{tx.id}</TableCell>
                  <TableCell>{getTypeBadge(tx.type)}</TableCell>
                  <TableCell className="text-gray-400 max-w-md">
                    <p className="truncate">{tx.description}</p>
                    <p className="text-xs text-gray-600 mt-1">By {tx.initiator} • {tx.timestamp}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{
                            width: `${(parseInt(tx.signatures.split("/")[0]) / parseInt(tx.signatures.split("/")[1])) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 font-mono">{tx.signatures}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction("approve", tx)}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction("reject", tx)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg"
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-gray-500">{mockTransactions.length} transactions</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              {mockTransactions.filter((t) => t.status === "Pending").length} Pending
            </span>
            <span className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              {mockTransactions.filter((t) => t.status === "Approved").length} Approved
            </span>
            <span className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              {mockTransactions.filter((t) => t.status === "Rejected").length} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} />
              Confirm Blockchain Transaction
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to {confirmDialog.action} this transaction?
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.transaction && (
            <div className="space-y-3">
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                <p className="text-sm text-gray-300 font-mono">{confirmDialog.transaction.id}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                {getTypeBadge(confirmDialog.transaction.type)}
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-300">{confirmDialog.transaction.description}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
                <p className="text-xs text-yellow-300">
                  ⚠️ This action will be recorded on the blockchain and cannot be undone.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDialog({ open: false, action: "", transaction: null })}
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
              Confirm {confirmDialog.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
