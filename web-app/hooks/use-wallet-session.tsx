"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface UserProfile {
    id: string
    username: string
    name: string
    email: string
    wallet_address: string
    role: 'admin' | 'user' | 'notary'
    liveness_status: string
    kyc_verified: boolean
}

interface UserBalances {
    wallet: string
    ntk: string
    ntkr: string
    bnb: string
}

interface LiveBalances {
    bnb: string | null
    ntkr: string | null
    ntk: string | null
    isLive: boolean
    chainId: number | null
}

interface WalletContextType {
    user: UserProfile | null
    balances: UserBalances | null
    connectedAccount: string | null
    chainId: number | null
    isLoading: boolean
    error: string | null
    liveBalances: LiveBalances
    refreshBalances: () => Promise<void>
    connectWallet: () => Promise<void>
    logout: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

import { apiClient } from "@/lib/api-client"

export function WalletProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [balances, setBalances] = useState<UserBalances | null>(null)
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Live balances state (initialized from cached balances)
    const [liveBalances, setLiveBalances] = useState<LiveBalances>({
        bnb: null,
        ntkr: null,
        ntk: null,
        isLive: false,
        chainId: null
    })

    const refreshBalances = async () => {
        try {
            // 1. Fetch cached balances from backend
            const data = await apiClient.get('/api/tokens/balance');
            setBalances(data);

            // 2. Fetch truly LIVE balances from MetaMask if connected
            if (typeof window !== "undefined" && window.ethereum && connectedAccount) {
                const { ethers } = await import("ethers");
                const provider = new ethers.BrowserProvider(window.ethereum);
                const bnbBal = await provider.getBalance(connectedAccount);

                // Update live state immediately
                setLiveBalances(prev => ({
                    ...prev,
                    bnb: ethers.formatEther(bnbBal),
                    isLive: true
                }));
                console.log("[WALLET] Live BNB Balance updated:", ethers.formatEther(bnbBal));
            }
        } catch (err: any) {
            console.error("Balance refresh failed:", err);
        }
    }

    const fetchProfile = async () => {
        try {
            const data = await apiClient.get('/me');
            setUser(data);
            await refreshBalances();
        } catch (err: any) {
            if (err.status !== 401) {
                setError(err.message || "Connectivity issue: Server unreachable");
            }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            console.warn("Logout request failed, clearing local state anyway");
        }

        // Task: Fix logout race condition
        // Clear tokens first
        localStorage.removeItem('bbsns_token');
        localStorage.removeItem('connectedWallet');

        // Hard redirect to home to prevent React re-renders on the protected page
        // which cause "Access Denied" or "Layout Crash" flashes.
        window.location.href = "/";
    }

    useEffect(() => {
        // Define public routes that don't require authentication
        const publicRoutes = ['/', '/login', '/signup', '/register-notary', '/auth/remote-login', '/governance/remote-sign'];
        const isPublicRoute = publicRoutes.some(route =>
            window.location.pathname === route || window.location.pathname.startsWith(route + '/')
        );

        // Only fetch profile if not on a public route
        if (!isPublicRoute) {
            fetchProfile();
        }

        const handleUnauthorized = () => {
            setUser(null);
            setBalances(null);
            // Only redirect if on a protected route
            if (!isPublicRoute && window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        };

        window.addEventListener('bbs_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('bbs_unauthorized', handleUnauthorized);
    }, [])

    const fetchWalletInfo = React.useCallback(async () => {
        if (typeof window === "undefined" || !window.ethereum) return;

        try {
            const { ethers } = await import("ethers");
            const provider = new ethers.BrowserProvider(window.ethereum);

            const network = await provider.getNetwork();
            const currentChainId = Number(network.chainId);
            setChainId(currentChainId);

            const accounts = await provider.send("eth_accounts", []);

            if (accounts.length === 0) {
                setConnectedAccount(null);
                setLiveBalances(prev => ({ ...prev, isLive: false, chainId: currentChainId }));
                return;
            }

            const account = accounts[0];
            setConnectedAccount(account);
            setLiveBalances(prev => ({ ...prev, isLive: true, chainId: currentChainId }));

            // Trigger balance refresh for the new account
            const bnbBal = await provider.getBalance(account);

            // Fetch Token Balances Live
            let ntkrBal = "0";
            let ntkBal = "0";
            try {
                const ntkrAddr = process.env.NEXT_PUBLIC_NTKR_CONTRACT_ADDRESS;
                const ntkAddr = process.env.NEXT_PUBLIC_NTK_CONTRACT_ADDRESS;
                const abi = ["function balanceOf(address) view returns (uint256)"];

                if (ntkrAddr) {
                    const ntkrContract = new ethers.Contract(ntkrAddr, abi, provider);
                    const bal = await ntkrContract.balanceOf(account);
                    ntkrBal = ethers.formatUnits(bal, 18);
                }

                if (ntkAddr) {
                    const ntkContract = new ethers.Contract(ntkAddr, abi, provider);
                    const bal = await ntkContract.balanceOf(account);
                    ntkBal = ethers.formatUnits(bal, 18);
                }
            } catch (err) {
                console.warn("Failed to fetch token balances", err);
            }

            setLiveBalances({
                bnb: ethers.formatEther(bnbBal),
                ntkr: ntkrBal,
                ntk: ntkBal,
                isLive: true,
                chainId: currentChainId
            });

            // DO NOT call refreshBalances() here - it creates an infinite loop
            // Backend balances are already fetched on initial mount via fetchProfile()
        } catch (err) {
            console.error("Failed to fetch wallet info", err);
        }
    }, []); // Empty dependency array - this function should be stable

    const connectWallet = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                await fetchWalletInfo();
            } catch (err: any) {
                console.error("Connection error", err);
            }
        }
    }

    // Task B.5: Guarded listeners and robust cleanup
    useEffect(() => {
        if (!user || typeof window === "undefined" || !window.ethereum) return;

        fetchWalletInfo();

        const handleChainChanged = () => window.location.reload();
        const handleAccountsChanged = () => fetchWalletInfo();

        const provider = window.ethereum;
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);

        return () => {
            if (provider?.removeListener) {
                provider.removeListener('accountsChanged', handleAccountsChanged);
                provider.removeListener('chainChanged', handleChainChanged);
            }
        }
    }, [user, fetchWalletInfo])

    return (
        <WalletContext.Provider value={{
            user,
            balances,
            connectedAccount,
            chainId,
            isLoading,
            error,
            liveBalances,
            refreshBalances,
            connectWallet,
            logout
        }}>
            {children}
        </WalletContext.Provider>
    )
}

export function useWalletSession() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWalletSession must be used within a WalletProvider")
    }
    return context
}
