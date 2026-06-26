"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, Loader2, ExternalLink, ShieldCheck, Download, AlertTriangle } from "lucide-react"
import { generateCertificatePDF } from "@/lib/pdf-utils"

interface VerificationData {
  document_id: number
  filename: string
  title: string
  file_hash: string
  status: string
  chain_confirmed: boolean
  approval_tx_hash: string | null
  notarized_at: string
  notary_wallet: string | null
  notary_name: string | null
  contract_address: string
  chain_id: number
}

export default function PublicVerifyPage() {
  const searchParams = useSearchParams()
  const initialHash = searchParams.get("hash") || ""
  const [hashQuery, setHashQuery] = useState(initialHash)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<VerificationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialHash && initialHash.length === 64) {
      handleVerify(initialHash)
    }
  }, [initialHash])

  const handleVerify = async (hashToVerify: string) => {
    if (!hashToVerify) return
    if (hashToVerify.length !== 64) {
      setError("Please enter a valid 64-character SHA-256 hash.")
      return
    }
    
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/documents/public/verify/${hashToVerify}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Document not found or not yet notarized.")
      }
      
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!data) return
    try {
      await generateCertificatePDF({
        filename: data.title || data.filename,
        fileHash: data.file_hash,
        status: data.status,
        txHash: data.approval_tx_hash || undefined,
        notaryWallet: data.notary_wallet || "System Assigned Notary",
        notaryName: data.notary_name || undefined,
        ownerWallet: "Redacted for Privacy",
        timestamp: data.notarized_at,
        contractAddress: data.contract_address,
        chainId: data.chain_id,
        verificationUrl: `https://app.bbsns.online/verify?hash=${data.file_hash}`,
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200 flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Public Document Verification</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            BBSNS provides cryptographically secure, immutable proof of digital assets. Enter a document's SHA-256 hash to verify its authenticity on the blockchain.
          </p>
        </div>

        {/* Search Box */}
        <Card className="bg-[#0D1526] border-slate-800 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex space-x-2">
              <Input
                value={hashQuery}
                onChange={(e) => setHashQuery(e.target.value)}
                placeholder="Enter SHA-256 Document Hash (64 characters)"
                className="bg-[#070B14] border-slate-700 text-slate-200 font-mono text-sm placeholder:text-slate-600 focus-visible:ring-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify(hashQuery)}
              />
              <Button 
                onClick={() => handleVerify(hashQuery)} 
                disabled={loading || !hashQuery}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Verify</span>
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md text-sm border border-red-500/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-[#0D1526] border-emerald-900/50 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]">
              <CardHeader className="border-b border-slate-800 pb-4 bg-emerald-500/5 rounded-t-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 text-white">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      Document Verified
                    </CardTitle>
                    <CardDescription className="text-emerald-500/70 mt-1">
                      Immutable proof found on the blockchain ledger
                    </CardDescription>
                  </div>
                  <Button onClick={handleDownload} variant="outline" className="bg-[#070B14] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Certificate
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                
                {/* File Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original File Name</p>
                    <p className="font-medium text-slate-200">{data.title || data.filename}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notarization Date</p>
                    <p className="font-medium text-slate-200">
                      {new Date(data.notarized_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 bg-[#070B14] p-4 rounded-lg border border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SHA-256 Cryptographic Hash</p>
                  <p className="font-mono text-sm text-emerald-400 break-all select-all">
                    {data.file_hash}
                  </p>
                </div>

                {/* Blockchain Info */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Ledger Evidence
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Network</p>
                      <p className="text-sm font-medium text-slate-300">BNB Smart Chain (BSC Testnet)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Registry Contract</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-slate-300 truncate" title={data.contract_address}>
                          {data.contract_address.substring(0, 12)}...{data.contract_address.substring(38)}
                        </p>
                        <a href={`https://testnet.bscscan.com/address/${data.contract_address}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-emerald-400 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Notary Identity</p>
                      <p className="text-sm font-mono text-slate-300 truncate" title={data.notary_wallet || ""}>
                        {data.notary_name ? `${data.notary_name} (${data.notary_wallet?.substring(0, 8)}...)` : (data.notary_wallet || "System Assigned")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Transaction Hash</p>
                      {data.approval_tx_hash ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-emerald-400 truncate" title={data.approval_tx_hash}>
                            {data.approval_tx_hash.substring(0, 12)}...{data.approval_tx_hash.substring(54)}
                          </p>
                          <a href={`https://testnet.bscscan.com/tx/${data.approval_tx_hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm font-mono text-yellow-500">Processing...</p>
                      )}
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
            
            <p className="text-center text-xs text-slate-500 mt-6 max-w-2xl mx-auto">
              This verification is mathematically guaranteed by the SHA-256 hash function and the decentralized BNB Smart Chain ledger. BBSNS cannot alter or forge this record.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
