"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { Shield, Database, Server, Cpu, HardDrive, Terminal, ExternalLink, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AboutProjectPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
            <Shield className="h-3.5 w-3.5" /> Project Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Block-Chain Based Secure Notarization System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A zero-trust platform bridging off-chain identity verification with on-chain cryptographic finality to digitalize the modern notary public system.
          </p>
        </motion.div>

        {/* Creator Callout */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-8 mb-16"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-primary">Meet the Creator</h2>
              <p className="text-muted-foreground max-w-xl">
                BBSNS was designed, built, and optimized by **Shubham Mate**. Discover his full-stack blockchain engineering experience, certificates, and interactive projects on his portfolio.
              </p>
            </div>
            <Link 
              href="https://creator.bbsns.online" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/25 cursor-pointer"
            >
              Explore Portfolio <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Architecture Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card 1: Web Client Portal */}
          <motion.div 
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
            variants={itemVariants}
          >
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Web Client Portal</h3>
            <p className="text-muted-foreground text-sm flex-1">
              Provides the entry point for clients to request notarizations. Handles local cryptographic hashing of documents, generates secure upload intents, and coordinates payment transactions via the utility token ecosystem.
            </p>
            <ul className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> Next.js Dynamic Client Console
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> EIP-712 Gasless Signatures
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Core API & Workers */}
          <motion.div 
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
            variants={itemVariants}
          >
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Core API Orchestrator</h3>
            <p className="text-muted-foreground text-sm flex-1">
              Express.js backend coordinates secure file streams directly to AWS S3 storage vaults via signed URLs, manages user roles in PostgreSQL, and runs background workers for status verification and resource scavenging.
            </p>
            <ul className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> Secure S3 Signed URL Vault
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> Self-Healing Background Workers
              </li>
            </ul>
          </motion.div>

          {/* Card 3: Blockchain Consensus */}
          <motion.div 
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
            variants={itemVariants}
          >
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Blockchain Consensus</h3>
            <p className="text-muted-foreground text-sm flex-1">
              Smart contracts on the BNB Smart Chain Testnet store notarized document hashes immutably, govern notary certifications, manage the tokenized service charges, and enforce multi-signature administrative oversight.
            </p>
            <ul className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> Solidity Smart Contracts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary" /> Multi-Sig Protocol Governance
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Technical Deep Dive */}
        <motion.div 
          className="border rounded-xl p-8 bg-card text-card-foreground mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-3">
            <Terminal className="h-6 w-6 text-primary" /> System Technical Architecture
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Immutable Document Vault</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Documents are never stored directly in the database. Instead, they are hashed locally in the client browser using SHA-256. The hash is saved as a secure on-chain reference, and the file is securely streamed to restricted AWS S3 storage buckets. File integrity is verified during every access request.
              </p>
              <h3 className="text-lg font-semibold mb-3">Self-Healing Workers</h3>
              <p className="text-sm text-muted-foreground">
                To bridge the latency difference between off-chain databases and the blockchain, BBSNS runs a background synchronization worker pool. It automatically recovers interrupted transactions, flags discrepancies, and cleans up expired upload intents safely.
              </p>
            </div>
            
            <div className="flex flex-col justify-center bg-muted/30 p-6 rounded-lg border">
              <h4 className="text-xs uppercase font-bold text-primary tracking-wider mb-4">Core Technology Stack</h4>
              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Next.js (Frontend)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Express.js (REST API)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Electron (Notary Client)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Solidity (Smart Contracts)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> PostgreSQL (Database)
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AWS S3 (Secure Storage)
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
