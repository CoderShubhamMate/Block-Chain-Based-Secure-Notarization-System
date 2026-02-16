import { useState } from "react";
import { Eye, Download, FileText, Image as ImageIcon, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const mockLogs = [
  {
    id: "REQ-2024-1847",
    fileType: "PDF",
    client: "Alice Cooper",
    notary: "John Smith",
    status: "Completed",
    timestamp: "2024-10-16 14:32:15",
    txHash: "0x8f2e...3a1c",
    transcription: null,
  },
  {
    id: "REQ-2024-1846",
    fileType: "Image",
    client: "Bob Martinez",
    notary: "Sarah Johnson",
    status: "Completed",
    timestamp: "2024-10-16 13:18:42",
    txHash: "0x7a2b...4d5e",
    transcription: "Certificate of Birth - Name: Robert Martinez, Date: 1985-03-15, Place: New York, NY",
  },
  {
    id: "REQ-2024-1845",
    fileType: "PDF",
    client: "Carol White",
    notary: "Michael Chen",
    status: "Pending",
    timestamp: "2024-10-16 12:05:33",
    txHash: null,
    transcription: null,
  },
  {
    id: "REQ-2024-1844",
    fileType: "Image",
    client: "David Brown",
    notary: "Emma Davis",
    status: "Rejected",
    timestamp: "2024-10-16 11:22:09",
    txHash: null,
    transcription: "Lease Agreement - Parties: David Brown & Estate Corp, Property: 123 Main St",
  },
  {
    id: "REQ-2024-1843",
    fileType: "PDF",
    client: "Eva Green",
    notary: "David Wilson",
    status: "Completed",
    timestamp: "2024-10-16 10:45:27",
    txHash: "0x5e6d...8b9a",
    transcription: null,
  },
];

export function SystemLogs() {
  const [filterType, setFilterType] = useState("all");
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);

  const filteredLogs = mockLogs.filter((log) => {
    if (filterType === "all") return true;
    return log.fileType.toLowerCase() === filterType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status}
      </Badge>
    );
  };

  const handleExport = () => {
    // Export logs as CSV
    alert("Exporting logs as CSV...");
  };

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-gray-100 mb-1">System Logs</h1>
            <p className="text-sm text-gray-400">View all notarization requests and transactions</p>
          </div>
          <Button onClick={handleExport} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
            <Download size={16} className="mr-2" />
            Export Logs (CSV)
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filter Chips */}
        <div className="flex gap-3 mb-6">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "ghost"}
            onClick={() => setFilterType("all")}
            className={`rounded-lg ${
              filterType === "all"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterType === "pdf" ? "default" : "ghost"}
            onClick={() => setFilterType("pdf")}
            className={`rounded-lg ${
              filterType === "pdf"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FileText size={14} className="mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant={filterType === "image" ? "default" : "ghost"}
            onClick={() => setFilterType("image")}
            className={`rounded-lg ${
              filterType === "image"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <ImageIcon size={14} className="mr-1" />
            Image
          </Button>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Request ID</TableHead>
                <TableHead className="text-gray-400">File Type</TableHead>
                <TableHead className="text-gray-400">Client</TableHead>
                <TableHead className="text-gray-400">Notary</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Timestamp</TableHead>
                <TableHead className="text-gray-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-gray-300 font-mono text-sm">{log.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.fileType === "PDF" ? (
                        <FileText size={16} className="text-blue-400" />
                      ) : (
                        <ImageIcon size={16} className="text-purple-400" />
                      )}
                      <span className="text-gray-400">{log.fileType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">{log.client}</TableCell>
                  <TableCell className="text-gray-400">{log.notary}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{log.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-400 hover:bg-blue-500/20 rounded-lg"
                    >
                      <Eye size={14} className="mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {filteredLogs.length} of {mockLogs.length} logs
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details - {selectedLog?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Client</p>
                  <p className="text-gray-200">{selectedLog.client}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Notary</p>
                  <p className="text-gray-200">{selectedLog.notary}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">File Type</p>
                  <div className="flex items-center gap-2">
                    {selectedLog.fileType === "PDF" ? (
                      <FileText size={16} className="text-blue-400" />
                    ) : (
                      <ImageIcon size={16} className="text-purple-400" />
                    )}
                    <p className="text-gray-200">{selectedLog.fileType}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedLog.status)}
                </div>
              </div>

              {/* Transaction Hash */}
              {selectedLog.txHash && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                  <p className="text-xs text-emerald-400 mb-1">Transaction Hash</p>
                  <p className="text-sm text-gray-300 font-mono">{selectedLog.txHash}</p>
                </div>
              )}

              {/* Transcription */}
              {selectedLog.transcription && (
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Transcription Text</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedLog.transcription}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-500 text-center">
                Processed on {selectedLog.timestamp}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
