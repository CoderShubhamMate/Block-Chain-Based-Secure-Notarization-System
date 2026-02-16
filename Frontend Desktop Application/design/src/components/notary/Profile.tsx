import { User, Shield, Wallet, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

export function Profile() {
  const profileData = {
    name: "John Smith",
    nationalId: "NT-2024-001",
    wallet: "0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    kycStatus: "Verified",
    joinDate: "2024-01-15",
    totalProcessed: 234,
    approvalRate: 92,
  };

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="p-6">
          <h1 className="text-gray-100 mb-1">My Profile</h1>
          <p className="text-sm text-gray-400">View and manage your notary profile information</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <User className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-gray-100 mb-2">{profileData.name}</h2>
                  <p className="text-sm text-gray-400">Certified Notary</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle size={14} />
                  {profileData.kycStatus}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm text-gray-300">January 15, 2024</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Processed</p>
                  <p className="text-sm text-emerald-400">{profileData.totalProcessed} requests</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-emerald-400" size={20} />
              <h3 className="text-gray-100">Personal Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm text-gray-300">{profileData.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">National ID</p>
                <p className="text-sm text-gray-300 font-mono">{profileData.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">KYC Status</p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle size={12} className="mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </Card>

          {/* Blockchain Information */}
          <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-emerald-400" size={20} />
              <h3 className="text-gray-100">Blockchain Wallet</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-xs text-gray-300 font-mono break-all">{profileData.wallet}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Network</p>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Sepolia Testnet
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Connection Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-400">Connected</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Stats */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-emerald-400" size={20} />
            <h3 className="text-gray-100">Performance Statistics</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-gray-100 mb-1">{profileData.totalProcessed}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-emerald-400 mb-1">{profileData.approvalRate}%</p>
              <p className="text-xs text-gray-500">Approval Rate</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-blue-400 mb-1">12 min</p>
              <p className="text-xs text-gray-500">Avg. Time</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-purple-400 mb-1">4.8/5.0</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "Approved request", id: "REQ-2024-1847", time: "2 hours ago" },
              { action: "Approved request", id: "REQ-2024-1846", time: "3 hours ago" },
              { action: "Rejected request", id: "REQ-2024-1844", time: "5 hours ago" },
              { action: "Approved request", id: "REQ-2024-1843", time: "6 hours ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action.includes("Approved") ? "bg-emerald-400" : "bg-red-400"
                  }`} />
                  <div>
                    <p className="text-sm text-gray-300">{activity.action}</p>
                    <p className="text-xs text-gray-500 font-mono">{activity.id}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11">
            <RefreshCw size={16} className="mr-2" />
            Sync with Blockchain
          </Button>
          <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-11">
            <User size={16} className="mr-2" />
            Refresh Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
