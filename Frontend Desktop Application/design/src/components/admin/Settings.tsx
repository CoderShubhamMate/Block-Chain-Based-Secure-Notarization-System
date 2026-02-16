import { Moon, Sun, Globe, Key, FileText, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

export function Settings() {
  return (
    <div className="flex-1 bg-[#0D1B2A] overflow-auto">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A2540] sticky top-0 z-10">
        <div className="p-6">
          <h1 className="text-gray-100 mb-1">Settings</h1>
          <p className="text-sm text-gray-400">Configure system preferences and network settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-gray-900/50 border border-gray-800 p-1 mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Network
            </TabsTrigger>
            <TabsTrigger value="system-key" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              System Key
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Logs
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-100 mb-4">Application Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-300">Version</p>
                    <p className="text-xs text-gray-500 mt-1">Current application version</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    v1.0.0
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-300">Build Date</p>
                    <p className="text-xs text-gray-500 mt-1">Last compilation timestamp</p>
                  </div>
                  <span className="text-sm text-gray-400">October 16, 2024</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-300">Platform</p>
                    <p className="text-xs text-gray-500 mt-1">Runtime environment</p>
                  </div>
                  <span className="text-sm text-gray-400">Electron + Web3j</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-100 mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Moon className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Theme</p>
                    <p className="text-xs text-gray-500 mt-1">Switch between light and dark mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Dark</span>
                  <Switch defaultChecked />
                  <span className="text-xs text-gray-500">Light</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-emerald-400" size={24} />
                <h3 className="text-gray-100">Blockchain Network</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Network</label>
                  <Select defaultValue="sepolia">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="mainnet">Ethereum Mainnet</SelectItem>
                      <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                      <SelectItem value="goerli">Goerli Testnet</SelectItem>
                      <SelectItem value="polygon">Polygon Mainnet</SelectItem>
                      <SelectItem value="mumbai">Mumbai Testnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-yellow-400">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-300 mb-1">Testnet Active</p>
                    <p className="text-xs text-yellow-300/70">
                      You are currently connected to Sepolia Testnet. Switch to Mainnet for production use.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">RPC Endpoint</span>
                    <span className="text-sm text-gray-500 font-mono">https://sepolia.infura.io/v3/...</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">Chain ID</span>
                    <span className="text-sm text-gray-500 font-mono">11155111</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-400">Contract Address</span>
                    <span className="text-sm text-gray-500 font-mono">0x742d...bEb3</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Key Tab */}
          <TabsContent value="system-key" className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-emerald-400" size={24} />
                <h3 className="text-gray-100">Admin System Key</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Key Hash (SHA-256)</p>
                  <p className="text-sm text-gray-300 font-mono break-all">
                    8f2e9a1c4b3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                  <Key className="text-blue-400 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Secure Key Management</p>
                    <p className="text-xs text-blue-300/70">
                      The system key is stored securely and encrypted. Use the JavaFX Key Manager for advanced operations.
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11">
                  <ExternalLink size={16} className="mr-2" />
                  Launch Key Manager (JavaFX)
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl">
                    Rotate Key
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl">
                    Export Backup
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-emerald-400" size={24} />
                <h3 className="text-gray-100">Application Logs</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-300">Enable Debug Logs</p>
                    <p className="text-xs text-gray-500 mt-1">Show detailed debugging information</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-300">Log Level</p>
                    <p className="text-xs text-gray-500 mt-1">Minimum severity to display</p>
                  </div>
                  <Select defaultValue="info">
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-300">Auto-clear Logs</p>
                    <p className="text-xs text-gray-500 mt-1">Clear logs older than 30 days</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl">
                    <FileText size={16} className="mr-2" />
                    View Full Logs
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
