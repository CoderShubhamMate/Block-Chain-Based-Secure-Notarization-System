import { Home, Users, FileText, CheckSquare, Settings, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";

interface SidebarProps {
  role: "admin" | "notary";
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function Sidebar({ role, activeScreen, onNavigate, onLogout }: SidebarProps) {
  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "manage-notaries", label: "Manage Notaries", icon: Users },
    { id: "system-logs", label: "System Logs", icon: FileText },
    { id: "multi-sig", label: "Multi-Sig Approvals", icon: CheckSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const notaryMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "pending", label: "Pending", icon: FileText },
    { id: "approved", label: "Approved", icon: CheckSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  const menuItems = role === "admin" ? adminMenuItems : notaryMenuItems;

  return (
    <div className="w-64 bg-[#0A2540] border-r border-gray-800 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-emerald-400">BBSNS</h2>
        <p className="text-xs text-gray-400 mt-1">
          {role === "admin" ? "Admin Portal" : "Notary Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
