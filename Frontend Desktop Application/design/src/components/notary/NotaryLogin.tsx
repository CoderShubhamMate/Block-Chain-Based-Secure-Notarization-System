import { useState } from "react";
import { User, Shield, Wallet, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";

interface NotaryLoginProps {
  onLogin: () => void;
}

export function NotaryLogin({ onLogin }: NotaryLoginProps) {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = (step / 3) * 100;

  const handleStep1Next = () => {
    if (userId && password) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 500);
    }
  };

  const handleStep2Verify = () => {
    if (nationalId) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 500);
    }
  };

  const handleConnectWallet = () => {
    setLoading(true);
    setTimeout(() => {
      setWalletAddress("0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b");
      setLoading(false);
    }, 500);
  };

  const handleFinalLogin = () => {
    if (walletAddress) {
      setLoading(true);
      setTimeout(() => {
        onLogin();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#0D1B2A] to-[#0A2540] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Step {step} of 3</span>
            <span className="text-sm text-emerald-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-800" />
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  s < step
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : s === step
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-600"
                }`}
              >
                {s < step ? <CheckCircle size={20} /> : s}
              </div>
            ))}
          </div>

          {/* Step 1: User Credentials */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                  <User className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-blue-400 mb-2">Notary Login</h2>
                <p className="text-sm text-gray-400">Enter your credentials to continue</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId" className="text-gray-400">User ID</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your user ID"
                    className="bg-gray-800 border-gray-700 text-gray-100 mt-2 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-400">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-gray-800 border-gray-700 text-gray-100 mt-2 h-11"
                  />
                </div>

                <Button
                  onClick={handleStep1Next}
                  disabled={!userId || !password || loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 mt-6"
                >
                  {loading ? "Verifying..." : "Next"}
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: National ID Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-blue-400 mb-2">Verify National ID</h2>
                <p className="text-sm text-gray-400">Confirm your identity with National ID</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nationalId" className="text-gray-400">National ID</Label>
                  <Input
                    id="nationalId"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Enter your national ID"
                    className="bg-gray-800 border-gray-700 text-gray-100 mt-2 h-11"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <p className="text-xs text-blue-300">
                    Your National ID will be verified against blockchain records.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStep2Verify}
                    disabled={!nationalId || loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11"
                  >
                    {loading ? "Verifying..." : "Verify"}
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Wallet Connect */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-4">
                  <Wallet className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-emerald-400 mb-2">Connect Wallet</h2>
                <p className="text-sm text-gray-400">Link your blockchain wallet to proceed</p>
              </div>

              <div className="space-y-4">
                {walletAddress ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="text-emerald-400" size={20} />
                      <p className="text-sm text-emerald-300">Wallet Connected</p>
                    </div>
                    <p className="text-xs text-emerald-400/70 font-mono break-all">{walletAddress}</p>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11"
                  >
                    <Wallet className="mr-2" size={16} />
                    {loading ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}

                {walletAddress && (
                  <Button
                    onClick={handleFinalLogin}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 mt-6"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <CheckCircle className="ml-2" size={16} />
                      </>
                    )}
                  </Button>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-11"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}
