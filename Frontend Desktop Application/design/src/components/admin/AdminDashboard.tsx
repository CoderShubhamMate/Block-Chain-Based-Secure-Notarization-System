import { Users, FileText, CheckCircle, Image, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 62 },
  { month: "Mar", count: 78 },
  { month: "Apr", count: 95 },
  { month: "May", count: 112 },
  { month: "Jun", count: 134 },
];

export function AdminDashboard() {
  const stats = [
    { label: "Total Notaries", value: "47", icon: Users, color: "emerald", trend: "+5" },
    { label: "Pending Requests", value: "23", icon: Activity, color: "yellow", trend: "-2" },
    { label: "Approved Notarizations", value: "1,847", icon: CheckCircle, color: "blue", trend: "+134" },
    { label: "Image-Based Notarizations", value: "542", icon: Image, color: "purple", trend: "+28" },
  ];

  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-gray-100 mb-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, Administrator</p>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
            <RefreshCw size={16} className="mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorMap = {
              emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
              yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
              purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
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
                  <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
                    {stat.trend}
                  </span>
                </div>
                <h2 className="text-gray-100 mb-1">{stat.value}</h2>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-100 mb-1">Notarizations Over Time</h3>
              <p className="text-sm text-gray-500">Monthly trend analysis</p>
            </div>
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "New notary approved", user: "John Smith", time: "5 minutes ago", type: "success" },
              { action: "Notarization completed", user: "Client #1847", time: "12 minutes ago", type: "info" },
              { action: "Multi-sig approved", user: "Admin Team", time: "1 hour ago", type: "success" },
              { action: "New notary pending", user: "Alice Johnson", time: "2 hours ago", type: "warning" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === "success" ? "bg-emerald-400" :
                  activity.type === "warning" ? "bg-yellow-400" : "bg-blue-400"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
