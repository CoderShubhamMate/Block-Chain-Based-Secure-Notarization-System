import { useState } from "react";
import { Search, Filter, UserCheck, UserX, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const mockNotaries = [
  { id: 1, name: "John Smith", nationalId: "NT-2024-001", wallet: "0x742d...bEb3", status: "Active" },
  { id: 2, name: "Sarah Johnson", nationalId: "NT-2024-002", wallet: "0x8f3e...2a1c", status: "Pending" },
  { id: 3, name: "Michael Chen", nationalId: "NT-2024-003", wallet: "0x9a2b...4d5e", status: "Active" },
  { id: 4, name: "Emma Davis", nationalId: "NT-2024-004", wallet: "0x1c4f...8b9a", status: "Revoked" },
  { id: 5, name: "David Wilson", nationalId: "NT-2024-005", wallet: "0x5e6d...3c2b", status: "Active" },
  { id: 6, name: "Lisa Anderson", nationalId: "NT-2024-006", wallet: "0x7f8a...1d4c", status: "Pending" },
  { id: 7, name: "Robert Taylor", nationalId: "NT-2024-007", wallet: "0x2b3c...5e6f", status: "Active" },
  { id: 8, name: "Jennifer Lee", nationalId: "NT-2024-008", wallet: "0x4d5e...7a8b", status: "Active" },
];

export function ManageNotaries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    notary: typeof mockNotaries[0] | null;
  }>({ open: false, action: "", notary: null });

  const filteredNotaries = mockNotaries.filter((notary) => {
    const matchesSearch =
      notary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notary.nationalId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || notary.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAction = (action: string, notary: typeof mockNotaries[0]) => {
    setConfirmDialog({ open: true, action, notary });
  };

  const confirmAction = () => {
    // Handle the action here
    setConfirmDialog({ open: false, action: "", notary: null });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Revoked: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="p-6">
          <h1 className="text-gray-100 mb-1">Manage Notaries</h1>
          <p className="text-sm text-gray-400">Approve, revoke, and manage notary accounts</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 text-gray-100 rounded-xl h-11"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-800 text-gray-100 rounded-xl h-11">
              <Filter className="mr-2" size={16} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">National ID</TableHead>
                <TableHead className="text-gray-400">Wallet Address</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotaries.map((notary) => (
                <TableRow key={notary.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-gray-300">{notary.name}</TableCell>
                  <TableCell className="text-gray-400 font-mono text-sm">{notary.nationalId}</TableCell>
                  <TableCell className="text-gray-400 font-mono text-sm">{notary.wallet}</TableCell>
                  <TableCell>{getStatusBadge(notary.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {notary.status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction("approve", notary)}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg"
                        >
                          <UserCheck size={14} className="mr-1" />
                          Approve
                        </Button>
                      )}
                      {notary.status === "Active" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction("revoke", notary)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg"
                        >
                          <UserX size={14} className="mr-1" />
                          Revoke
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-500/20 rounded-lg"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredNotaries.length} of {mockNotaries.length} notaries</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              {mockNotaries.filter(n => n.status === "Active").length} Active
            </span>
            <span className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-400" />
              {mockNotaries.filter(n => n.status === "Pending").length} Pending
            </span>
            <span className="flex items-center gap-2">
              <XCircle size={16} className="text-red-400" />
              {mockNotaries.filter(n => n.status === "Revoked").length} Revoked
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Confirm {confirmDialog.action === "approve" ? "Approval" : "Revocation"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to {confirmDialog.action} notary{" "}
              <span className="text-emerald-400">{confirmDialog.notary?.name}</span>?
              {confirmDialog.action === "revoke" && " This action will revoke their access to the system."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDialog({ open: false, action: "", notary: null })}
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
