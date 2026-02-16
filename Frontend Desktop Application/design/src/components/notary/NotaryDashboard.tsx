import { FileText, CheckCircle, XCircle, Eye, Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface NotaryDashboardProps {
  onViewRequest: (requestId: string) => void;
}

const mockRequests = [
  { id: "REQ-2024-1847", fileType: "PDF", client: "Alice Cooper", status: "Pending", date: "2024-10-16 14:32" },
  { id: "REQ-2024-1846", fileType: "Image", client: "Bob Martinez", status: "Pending", date: "2024-10-16 13:18" },
  { id: "REQ-2024-1845", fileType: "PDF", client: "Carol White", status: "Pending", date: "2024-10-16 12:05" },
  { id: "REQ-2024-1844", fileType: "Image", client: "David Brown", status: "Approved", date: "2024-10-16 11:22" },
  { id: "REQ-2024-1843", fileType: "PDF", client: "Eva Green", status: "Approved", date: "2024-10-16 10:45" },
  { id: "REQ-2024-1842", fileType: "Image", client: "Frank Miller", status: "Rejected", date: "2024-10-16 09:30" },
];

export function NotaryDashboard({ onViewRequest }: NotaryDashboardProps) {
  const stats = [
    {
      label: "Pending Requests",
      value: mockRequests.filter(r => r.status === "Pending").length,
      icon: FileText,
      color: "yellow",
    },
    {
      label: "Approved",
      value: mockRequests.filter(r => r.status === "Approved").length,
      icon: CheckCircle,
      color: "emerald",
    },
    {
      label: "Rejected",
      value: mockRequests.filter(r => r.status === "Rejected").length,
      icon: XCircle,
      color: "red",
    },
  ];

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

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="p-6">
          <h1 className="text-gray-100 mb-1">Notary Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, review and process notarization requests</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorMap = {
              yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
              red: "bg-red-500/20 text-red-400 border-red-500/30",
            };
            
            return (
              <Card
                key={stat.label}
                className="bg-gray-900/50 border-gray-800 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[stat.color as keyof typeof colorMap]}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h2 className="text-gray-100 mb-1">{stat.value}</h2>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Requests Table */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-100 mb-4">Recent Requests</h3>
          
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Request ID</TableHead>
                  <TableHead className="text-gray-400">File Type</TableHead>
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((request) => (
                  <TableRow key={request.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-gray-300 font-mono text-sm">{request.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.fileType === "PDF" ? (
                          <FileText size={16} className="text-blue-400" />
                        ) : (
                          <ImageIcon size={16} className="text-purple-400" />
                        )}
                        <span className="text-gray-400">{request.fileType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{request.client}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{request.date}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => onViewRequest(request.id)}
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg"
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
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-100 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Processed</span>
                <span className="text-emerald-400">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Approval Rate</span>
                <span className="text-emerald-400">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Avg. Processing Time</span>
                <span className="text-blue-400">12 min</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-100 mb-4">File Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-sm text-gray-400">PDF Documents</span>
                </div>
                <span className="text-gray-300">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-purple-400" />
                  <span className="text-sm text-gray-400">Image Files</span>
                </div>
                <span className="text-gray-300">38%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
