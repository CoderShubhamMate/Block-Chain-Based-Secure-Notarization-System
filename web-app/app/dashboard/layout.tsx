"use client"

import { useEffect, useState } from "react"
import { useWalletSession } from "@/hooks/use-wallet-session"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function DashboardLayoutShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { user, isLoading, error } = useWalletSession()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isLoading && !user && !error) {
            router.push("/login")
        }
    }, [user, isLoading, error, router, mounted])

    if (!mounted) return null

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-primary font-medium">Synchronizing Session...</span>
                </motion.div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl">
                        <h2 className="text-2xl font-bold text-destructive mb-2">Access Issue</h2>
                        <p className="text-muted-foreground">{error || "You are not authorized to view this page. Please sign in."}</p>
                    </div>
                    <Button onClick={() => window.location.href = "/login"} variant="outline" className="w-full">
                        Return to Login
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

            <div className={cn("lg:ml-64 relative isolate")}>
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
