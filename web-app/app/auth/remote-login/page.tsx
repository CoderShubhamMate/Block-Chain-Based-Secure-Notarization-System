"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Wallet, AlertCircle, CheckCircle2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

function RemoteLoginContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    const sessionId = searchParams.get("sessionId")
    const [status, setStatus] = useState<"loading" | "ready" | "signing" | "authorized" | "expired" | "error">("loading")
    const [error, setError] = useState<string | null>(null)
    const [sessionData, setSessionData] = useState<any>(null)
    const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

    useEffect(() => {
        const checkWallet = async () => {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                try {
                    const { ethers } = await import("ethers")
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const accounts = await provider.listAccounts()
                    if (accounts.length > 0) {
                        setConnectedWallet(accounts[0].address)
                    }
                } catch (e) { }
            }
        }
        checkWallet()
    }, [])

    useEffect(() => {
        if (!sessionId) {
            setError("Missing Session ID. Please restart the login flow from the Desktop App.")
            setStatus("error")
            return
        }

        const fetchSession = async () => {
            try {
                const res = await fetch(`http://localhost:5000/auth/remote/status/${sessionId}`)
                if (!res.ok) throw new Error("Session not found or expired")
                const data = await res.json()

                if (data.status !== "pending") {
                    setStatus(data.status as any)
                    return
                }

                setSessionData(data)
                setStatus("ready")
            } catch (err: any) {
                setError(err.message)
                setStatus("error")
            }
        }

        fetchSession()
    }, [sessionId])

    const handleAuthorize = async () => {
        if (typeof window === "undefined" || !(window as any).ethereum) {
            toast({
                title: "MetaMask Not Found",
                description: "Please install MetaMask to authorize this session.",
                variant: "destructive"
            })
            return
        }

        setStatus("signing")
        try {
            const { ethers } = await import("ethers")
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const accounts = await provider.send("eth_requestAccounts", [])
            const signer = await provider.getSigner()
            const walletAddress = await signer.getAddress()
            setConnectedWallet(walletAddress)

            const res = await fetch(`http://localhost:5000/auth/remote/status/${sessionId}`)
            const data = await res.json()

            if (!data.challenge) throw new Error("Security challenge missing from session")

            const signature = await signer.signMessage(data.challenge)

            const authRes = await fetch("http://localhost:5000/auth/remote/authorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    walletAddress,
                    signature
                })
            })

            if (!authRes.ok) {
                const err = await authRes.json()
                throw new Error(err.error || "Authorization failed")
            }

            setStatus("authorized")
            toast({
                title: "Authorization Successful",
                description: "You can now return to the Desktop App."
            })
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Failed to authorize session")
            setStatus("error")
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/10">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Desktop App Login</CardTitle>
                    <CardDescription>
                        Authorize a secure session for your BBSNS Desktop application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <AnimatePresence mode="wait">
                        {status === "loading" && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-8 space-y-4"
                            >
                                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Verifying session...</p>
                            </motion.div>
                        )}

                        {status === "ready" && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <Alert className="bg-blue-500/5 border-blue-500/20">
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <AlertTitle>Secure Connection</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        This request originated from your Desktop App. Signing this will grant it access to your account for 12 hours.
                                    </AlertDescription>
                                </Alert>

                                {connectedWallet && (
                                    <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-mono">
                                                {connectedWallet.substring(0, 6)}...{connectedWallet.substring(38)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Connected</span>
                                    </div>
                                )}

                                <Button onClick={handleAuthorize} className="w-full h-12 gap-2 text-lg">
                                    <Wallet className="w-5 h-5" /> Sign with MetaMask
                                </Button>
                            </motion.div>
                        )}

                        {status === "signing" && (
                            <motion.div
                                key="signing"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center py-8 space-y-4"
                            >
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="font-medium animate-pulse">Check MetaMask Extension...</p>
                                <p className="text-xs text-muted-foreground">Sign the secure challenge to continue.</p>
                            </motion.div>
                        )}

                        {status === "authorized" && (
                            <motion.div
                                key="authorized"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-8 space-y-4 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Successfully Authorized</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        You can close this tab and return to the Desktop App.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => window.close()} className="mt-4">
                                    Close Tab
                                </Button>
                            </motion.div>
                        )}

                        {status === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                                    Go to Login
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="text-center text-[10px] text-muted-foreground opacity-50">
                    Session ID: {sessionId}
                </CardFooter>
            </Card>
        </div>
    )
}

export default function RemoteLoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RemoteLoginContent />
        </Suspense>
    )
}
