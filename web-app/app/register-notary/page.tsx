"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { useToast } from "../../hooks/use-toast"
import {
    Check,
    Shield,
    Wallet,
    Camera,
    ArrowRight,
    ArrowLeft,
    FileText,
    Lock,
    UserCheck,
    Globe,
    CheckCircle2
} from "lucide-react"
import { cn } from "../../lib/utils"
import { countries } from "../../lib/countries"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import dynamic from "next/dynamic"

const LivenessCheck = dynamic(
    () => import("../../components/auth/liveness-check").then((mod) => mod.LivenessCheck),
    { ssr: false }
)

export default function RegisterNotaryPage() {
    const [step, setStep] = useState(1) // 1: Form, 2: Verification
    const [applicationId, setApplicationId] = useState<number | null>(null)
    const [isLivenessDone, setIsLivenessDone] = useState(false)
    const [isWalletSigned, setIsWalletSigned] = useState(false)
    const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [openCombobox, setOpenCombobox] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "US") || countries[0])

    const [openNationality, setOpenNationality] = useState(false)
    const [selectedNationality, setSelectedNationality] = useState(countries.find(c => c.code === "US") || countries[0])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        license: "",
        experience: "",
        password: "",
        nationalId: "",
    })

    const router = useRouter()
    const { toast } = useToast()

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmitPhase1 = async () => {
        let wallet = localStorage.getItem("connectedWallet");
        if (!wallet && (window as any).ethereum) {
            try {
                const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                wallet = accounts[0];
                if (wallet) localStorage.setItem("connectedWallet", wallet);
            } catch (e) { }
        }

        if (!wallet) {
            toast({
                title: "Wallet Link Required",
                description: "Please connect MetaMask to link your professional identity.",
                variant: "destructive"
            });
            return;
        }

        const missing = [];
        if (!formData.name) missing.push("Full Name");
        if (!formData.email) missing.push("Email");
        if (!formData.password) missing.push("Password");
        if (!formData.license) missing.push("License Number");
        if (!formData.nationalId) missing.push("National ID");

        if (missing.length > 0) {
            toast({ title: "Missing Fields", description: `Please fill: ${missing.join(", ")}`, variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notaries/applications/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.name,
                    email: formData.email,
                    password: formData.password,
                    walletAddress: wallet,
                    phone: `${selectedCountry.dial_code} ${formData.phone}`,
                    license: formData.license,
                    experience: formData.experience,
                    nationalId: formData.nationalId,
                    nationality: selectedNationality.name
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Submission failed");

            setApplicationId(data.id);
        } catch (e: any) {
            if (e.message.includes("pending")) {
                toast({
                    title: "Application in Progress",
                    description: `${e.message} Use the same wallet to finish Phase 2.`,
                    action: (
                        <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                            Resume Verification
                        </Button>
                    )
                });
            } else {
                toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignWallet = async () => {
        if (!applicationId || !window.ethereum) return;
        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const message = `BBSNS-NOTARY-BIND:${applicationId}`;
            const sig = await signer.signMessage(message);
            setSignature(sig);
            setIsWalletSigned(true);
            toast({ title: "Signature Valid", description: "Wallet bound to professional ID." });
        } catch (err: any) {
            toast({ title: "Signing Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFinalizeVerification = async () => {
        if (!signature || !faceDescriptor) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notaries/applications/${applicationId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    faceDescriptor
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed on server.");

            toast({
                title: "KYC Verified & Locked",
                description: "Your application is now under administrative review.",
            });
            router.push("/");
        } catch (err: any) {
            toast({ title: "Verification Error", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-primary/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 container max-w-5xl mx-auto py-12 px-4">
                {/* Navigation */}
                <motion.button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </motion.button>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left Side: Info & Steps */}
                    <motion.div
                        className="lg:col-span-5 space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                                <Shield size={14} /> Official Registration
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                Apply to become a <br />
                                <span className="text-primary">Verified Notary</span>
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Join our decentralized network of trusted notaries. Our automated system ensures high security through multi-factor authentication and blockchain binding.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { step: 1, title: "Intent & Information", desc: "Submit your professional credentials and identity info.", icon: FileText },
                                { step: 2, title: "Biometric & Wallet Binding", desc: "Perform liveness check and sign with your wallet.", icon: UserCheck },
                                { step: 3, title: "Review & Activation", desc: "Administrator reviews your application for final activation.", icon: Lock },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                                        step >= item.step
                                            ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                            : "bg-slate-900 border-slate-800 text-slate-500"
                                    )}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-bold transition-colors",
                                            step >= item.step ? "text-white" : "text-slate-500"
                                        )}>{item.title}</h3>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-blue-400">
                                <Lock size={16} /> Privacy & Zero-Trust
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                We follow a strict zero-trust policy. Your biometric data is processed instantly and deleted after verification. Unapproved applications are permanently purged from our servers to ensure your privacy.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Form Content */}
                    <motion.div
                        className="lg:col-span-7"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Shield size={120} />
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Full Legal Name</Label>
                                                <Input
                                                    placeholder="As shown on ID"
                                                    className="bg-slate-950 border-slate-800 h-12 focus:ring-primary"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Official Email</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    className="bg-slate-950 border-slate-800 h-12"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Nationality</Label>
                                            <Popover open={openNationality} onOpenChange={setOpenNationality}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between h-12 px-4 bg-slate-950 border-slate-800 hover:bg-slate-900"
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <span className="text-xl leading-none">{selectedNationality.flag}</span>
                                                            <span className="font-medium text-slate-300">{selectedNationality.name}</span>
                                                        </span>
                                                        <Globe className="h-4 w-4 opacity-50 text-primary" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[350px] p-0 bg-slate-950 border-slate-800 shadow-2xl z-[100]" align="start">
                                                    <Command shouldFilter={true}>
                                                        <CommandInput placeholder="Search country..." className="h-12 border-none focus:ring-0 text-white" />
                                                        <CommandList className="max-h-[300px] scrollbar-thin scrollbar-thumb-slate-800">
                                                            <CommandEmpty>No results found.</CommandEmpty>
                                                            <CommandGroup heading="Countries">
                                                                {countries.map((c) => (
                                                                    <CommandItem
                                                                        key={c.code}
                                                                        value={`${c.name} ${c.code}`}
                                                                        onSelect={() => { setSelectedNationality(c); setOpenNationality(false); }}
                                                                        className="hover:bg-slate-900 text-slate-300"
                                                                    >
                                                                        <span className="mr-3 text-xl">{c.flag}</span> {c.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">National ID Number</Label>
                                                <Input
                                                    placeholder="ID Card / Passport No."
                                                    className="bg-slate-950 border-slate-800 h-12"
                                                    value={formData.nationalId}
                                                    onChange={(e) => handleInputChange("nationalId", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Login Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Choose a strong password"
                                                    className="bg-slate-950 border-slate-800 h-12"
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Mobile Number</Label>
                                            <div className="flex gap-2">
                                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-[100px] h-12 px-3 bg-slate-950 border-slate-800">
                                                            <span className="flex items-center gap-1 font-bold text-primary">{selectedCountry.dial_code}</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0 bg-slate-950 border-slate-800 z-[100]">
                                                        <Command shouldFilter={true}>
                                                            <CommandInput placeholder="Search codes..." className="h-12" />
                                                            <CommandList className="max-h-[250px]">
                                                                {countries.map((c) => (
                                                                    <CommandItem
                                                                        key={`dial-${c.code}`}
                                                                        value={`${c.name} ${c.dial_code}`}
                                                                        onSelect={() => { setSelectedCountry(c); setOpenCombobox(false); }}
                                                                        className="hover:bg-slate-900"
                                                                    >
                                                                        <span className="mr-2">{c.flag}</span> {c.name} ({c.dial_code})
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <Input
                                                    placeholder="000 000 000"
                                                    className="flex-1 bg-slate-950 border-slate-800 h-12"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Notary License Number</Label>
                                            <Input
                                                placeholder="Issued official license code"
                                                className="bg-slate-950 border-slate-800 h-12"
                                                value={formData.license}
                                                onChange={(e) => handleInputChange("license", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Professional Experience & Declaration of Intent</Label>
                                            <Textarea
                                                placeholder="State your professional background and your intent to act as a certified notary public within the system..."
                                                className="bg-slate-950 border-slate-800 min-h-[120px] p-4 focus:ring-primary"
                                                value={formData.experience}
                                                onChange={(e) => handleInputChange("experience", e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                            onClick={handleSubmitPhase1}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Submitting Application..." : "Submit Application & Continue"}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10 py-4"
                                    >
                                        <div className="text-center space-y-2">
                                            <h2 className="text-2xl font-bold">Identity & Wallet Security</h2>
                                            <p className="text-slate-400">Finalize your application by proving your identity and linking your wallet.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className={cn(
                                                "p-6 rounded-[1.5rem] border transition-all duration-500",
                                                isLivenessDone
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-slate-950/50 border-slate-800"
                                            )}>
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                            isLivenessDone ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                                                        )}>
                                                            <Camera size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold">Face Liveness Verification</h4>
                                                            <p className="text-xs text-slate-500 italic">Neural biometric scanning.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isLivenessDone ? (
                                                    <LivenessCheck onComplete={(desc) => {
                                                        setFaceDescriptor(desc);
                                                        setIsLivenessDone(true);
                                                        toast({ title: "Biometric Success", description: "Face descriptor generated successfully." });
                                                    }} />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-400 font-bold justify-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                        <CheckCircle2 size={20} /> Verified Biometric Signal
                                                    </div>
                                                )}
                                            </div>

                                            {/* Wallet Sign Card */}
                                            <div className={cn(
                                                "p-6 rounded-[1.5rem] border transition-all duration-500 flex items-center justify-between gap-4",
                                                isWalletSigned
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-slate-950/50 border-slate-800",
                                                !isLivenessDone && "opacity-50 grayscale"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                        isWalletSigned ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                                                    )}>
                                                        <Wallet size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Cryptographic Wallet Binding</h4>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">Sign: APP-{applicationId || '000'}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleSignWallet}
                                                    variant={isWalletSigned ? "secondary" : "default"}
                                                    disabled={!isLivenessDone || isWalletSigned || isLoading}
                                                    className="min-w-[120px]"
                                                >
                                                    {isWalletSigned ? "Bound 🖋️" : "Sign & Bind"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                className="w-full h-14 text-lg font-extrabold bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40"
                                                disabled={!isLivenessDone || !isWalletSigned || isLoading}
                                                onClick={handleFinalizeVerification}
                                            >
                                                {isLoading ? "Processing Final Step..." : "Finalize & Lock Profile"}
                                            </Button>
                                            <p className="text-[10px] text-center text-slate-500 px-8 leading-relaxed">
                                                By finalizing, your profile enters the <strong>LOCKED</strong> state. You will be notified via email once an administrator activates your account. Your identity data is strictly protected.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
        .glow-effect {
          box-shadow: 0 0 60px 10px rgba(59, 130, 246, 0.3);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
        </div>
    )
}
