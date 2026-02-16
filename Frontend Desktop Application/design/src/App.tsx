import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { RoleSelection } from "./components/RoleSelection";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManageNotaries } from "./components/admin/ManageNotaries";
import { SystemLogs } from "./components/admin/SystemLogs";
import { MultiSigApprovals } from "./components/admin/MultiSigApprovals";
import { Settings } from "./components/admin/Settings";
import { NotaryLogin } from "./components/notary/NotaryLogin";
import { NotaryDashboard } from "./components/notary/NotaryDashboard";
import { RequestDetails } from "./components/notary/RequestDetails";
import { Profile } from "./components/notary/Profile";
import { Sidebar } from "./components/shared/Sidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";

type AppState = "role-selection" | "admin-login" | "admin-app" | "notary-login" | "notary-app";
type AdminScreen = "dashboard" | "manage-notaries" | "system-logs" | "multi-sig" | "settings";
type NotaryScreen = "dashboard" | "pending" | "approved" | "profile" | "request-details";

function AppContent() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>("role-selection");
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("dashboard");
  const [notaryScreen, setNotaryScreen] = useState<NotaryScreen>("dashboard");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleRoleSelect = (role: "admin" | "notary") => {
    if (role === "admin") {
      setAppState("admin-login");
      navigate("/admin-login");
    } else {
      setAppState("notary-login");
      navigate("/notary-login");
    }
  };

  const handleAdminLogin = () => {
    setAppState("admin-app");
    setAdminScreen("dashboard");
    navigate("/admin/dashboard");
  };

  const handleNotaryLogin = () => {
    setAppState("notary-app");
    setNotaryScreen("dashboard");
    navigate("/notary/dashboard");
  };

  const handleAdminNavigate = (screen: string) => {
    setAdminScreen(screen as AdminScreen);
    navigate(`/admin/${screen}`);
  };

  const handleNotaryNavigate = (screen: string) => {
    if (screen === "pending" || screen === "approved") {
      // For now, show dashboard for these
      setNotaryScreen("dashboard");
      navigate("/notary/dashboard");
    } else {
      setNotaryScreen(screen as NotaryScreen);
      navigate(`/notary/${screen}`);
    }
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setNotaryScreen("request-details");
    navigate(`/notary/request/${requestId}`);
  };

  const handleBackFromRequestDetails = () => {
    setSelectedRequestId(null);
    setNotaryScreen("dashboard");
    navigate("/notary/dashboard");
  };

  const handleLogoutRequest = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    setAppState("role-selection");
    setAdminScreen("dashboard");
    setNotaryScreen("dashboard");
    setSelectedRequestId(null);
    navigate("/");
  };

  // Role Selection
  if (appState === "role-selection") {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // Admin Login
  if (appState === "admin-login") {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  // Notary Login
  if (appState === "notary-login") {
    return <NotaryLogin onLogin={handleNotaryLogin} />;
  }

  // Admin App
  if (appState === "admin-app") {
    return (
      <div className="flex h-screen bg-[#0D1B2A]">
        <Sidebar
          role="admin"
          activeScreen={adminScreen}
          onNavigate={handleAdminNavigate}
          onLogout={handleLogoutRequest}
        />

        {adminScreen === "dashboard" && <AdminDashboard />}
        {adminScreen === "manage-notaries" && <ManageNotaries />}
        {adminScreen === "system-logs" && <SystemLogs />}
        {adminScreen === "multi-sig" && <MultiSigApprovals />}
        {adminScreen === "settings" && <Settings />}

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to log out? You will need to reconnect your wallet to log back in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setLogoutDialogOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
                Confirm Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Notary App
  if (appState === "notary-app") {
    return (
      <div className="flex h-screen bg-[#0D1B2A]">
        <Sidebar
          role="notary"
          activeScreen={notaryScreen}
          onNavigate={handleNotaryNavigate}
          onLogout={handleLogoutRequest}
        />

        {notaryScreen === "dashboard" && (
          <NotaryDashboard onViewRequest={handleViewRequest} />
        )}
        {notaryScreen === "request-details" && selectedRequestId && (
          <RequestDetails
            requestId={selectedRequestId}
            onBack={handleBackFromRequestDetails}
          />
        )}
        {notaryScreen === "profile" && <Profile />}

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to log out? You will need to reconnect your wallet to log back in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setLogoutDialogOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
                Confirm Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/admin-login" element={<AppContent />} />
        <Route path="/notary-login" element={<AppContent />} />
        <Route path="/admin/:screen" element={<AppContent />} />
        <Route path="/notary/:screen" element={<AppContent />} />
        <Route path="/notary/request/:id" element={<AppContent />} />
      </Routes>
    </Router>
  );
}
