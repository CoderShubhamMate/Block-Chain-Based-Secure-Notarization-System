import { useState } from "react";
import { Wallet, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleConnectWallet = () => {
    // Simulate wallet connection
    setTimeout(() => {
      setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3");
      setWalletConnected(true);
      setError("");
    }, 500);
  };

  const handleVerifyLogin = () => {
    setVerifying(true);
    setError("");
    
    // Simulate verification
    setTimeout(() => {
      setVerifying(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#0D1B2A] to-[#0A2540] flex">
      {/* Left Side - Visual */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-emerald-500/20 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/20">
            <Lock className="w-16 h-16 text-emerald-400" />
          </div>
          <h2 className="text-emerald-400 mb-4">Secure Admin Access</h2>
          <p className="text-gray-400 max-w-md">
            Connect your admin wallet to access the blockchain-based notarization system
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-emerald-400 mb-2">Admin Login</h1>
              <p className="text-gray-400">Connect your admin wallet to continue</p>
            </div>

            <div className="space-y-6">
              {/* Wallet Address Display */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                <div className={`bg-gray-800/50 border rounded-xl p-4 flex items-center gap-3 ${
                  walletConnected ? "border-emerald-500/50" : "border-gray-700"
                }`}>
                  <Wallet className={walletConnected ? "text-emerald-400" : "text-gray-600"} size={20} />
                  <span className="text-sm text-gray-400 font-mono">
                    {walletAddress || "Not connected"}
                  </span>
                  {walletConnected && (
                    <CheckCircle className="ml-auto text-emerald-400" size={20} />
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Connect Wallet Button */}
              {!walletConnected ? (
                <Button
                  onClick={handleConnectWallet}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
                >
                  <Wallet className="mr-2" size={20} />
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  onClick={handleVerifyLogin}
                  disabled={verifying}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={20} />
                      Verify & Login
                    </>
                  )}
                </Button>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <Lock className="text-blue-400 mt-0.5" size={16} />
                <p className="text-xs text-blue-300">
                  Your wallet will be verified against the admin key stored securely on the blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
