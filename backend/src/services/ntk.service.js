'use strict';

/**
 * NTK Service
 * Automates the distribution and burning of Notary Action Tokens (NTK).
 */

const { ethers } = require('ethers');
const pool = require('../db/index');
const ProviderService = require('../blockchain/provider-service');
const ConfigService = require('./config.service');

async function getRelayerWallet() {
    const provider = await ProviderService.getProvider();
    
    // 🛡️ Signer Resolver (KMS or Private Key) - Optimized for Production (IAM Roles)
    const kmsKeyId = process.env.AWS_KMS_KEY_ID;

    // In production, credentials are often handled by IAM Roles on the EC2 instance, 
    // so we don't strictly require AWS_ACCESS_KEY_ID in the environment.
    if (kmsKeyId && kmsKeyId !== 'your_kms_key_id') {
        console.log(`🔐 NTK_SERVICE: Using AWS KMS signing (Key: ${kmsKeyId})`);
        const { KMSSigner } = require("../blockchain/kms-signer");
        return new KMSSigner(kmsKeyId, provider, { region: process.env.AWS_REGION || "ap-south-1" });
    } 
    
    // Fallback to Private Keys (Standardize across RELAYER and BNB_SYSTEM)
    const pk = process.env.RELAYER_PRIVATE_KEY || process.env.BNB_SYSTEM_PRIVATE_KEY;
    
    if (pk && pk.length > 32) {
        console.warn("ℹ️ NTK_SERVICE: Fallback to plaintext Private Key");
        return new ethers.Wallet(pk, provider);
    }

    throw new Error("NTK_SERVICE: No valid blockchain signer found (KMS or Private Key missing).");
}

/**
 * Burn 1 NTK for a notary action (Approve/Reject).
 * @param {string} walletAddress The notary's wallet address
 */
async function burnNTKForAction(walletAddress) {
    try {
        const config = await ConfigService.getConfig();
        const ntkAddress = config.contracts.ntk;
        if (!ntkAddress) {
            console.warn("[NTK_BURN] Skipping: NTK contract not configured.");
            return;
        }

        const wallet = await getRelayerWallet();
        const abi = ["function burnForAction(address notary) external"];
        const contract = new ethers.Contract(ntkAddress, abi, wallet);

        console.log(`[NTK_BURN] Burning 1 NTK for notary ${walletAddress}...`);
        const tx = await contract.burnForAction(walletAddress);
        
        tx.wait().then(receipt => {
            console.log(`[NTK_BURN] SUCCESS: ${receipt.hash}`);
            try {
                const { logAction } = require('../utils/logger');
                logAction(
                    'TOKEN_BURN',
                    `1 NTK burned for notary action from wallet ${walletAddress}.`,
                    'system',
                    { wallet: walletAddress, tx_hash: receipt.hash }
                );
            } catch (e) {
                console.error("Failed to log burn action:", e.message);
            }
        }).catch(err => {
            console.error(`[NTK_BURN_ERROR] Transaction failed to mine:`, err.message);
        });

    } catch (err) {
        console.error("[NTK_BURN_ERROR] Failed to initiate burn:", err.message);
    }
}

/**
 * Mint daily NTK for all active notaries to top them up to 100.
 */
async function mintDailyNTKForAll() {
    try {
        const config = await ConfigService.getConfig();
        const ntkAddress = config.contracts.ntk;
        if (!ntkAddress || ntkAddress === ethers.ZeroAddress) {
            console.warn("[NTK_MINT_WORKER] Skipping: NTK contract not configured in SSoT.");
            return;
        }

        console.log(`[NTK_MINT_WORKER] Using NTK Contract: ${ntkAddress}`);

        const wallet = await getRelayerWallet();
        // Use a combined ABI for balance check and minting
        const abi = [
            "function balanceOf(address account) view returns (uint256)",
            "function provisionNTK(address notary) external"
        ];
        const contract = new ethers.Contract(ntkAddress, abi, wallet);

        // 🛡️ Use authoritative identity_state = 'ACTIVE'
        const res = await pool.query(
            "SELECT wallet_address, name FROM users WHERE role = 'notary' AND identity_state = 'ACTIVE' AND wallet_address IS NOT NULL"
        );
        
        const notaries = res.rows;
        if (notaries.length === 0) {
            console.log("[NTK_MINT_WORKER] No active notaries found to mint for.");
            return;
        }

        const TARGET_LEVEL = ethers.parseUnits("100", 18);
        console.log(`[NTK_MINT_WORKER] Starting top-up check for ${notaries.length} notaries...`);

        for (const notary of notaries) {
            try {
                // 1. Check current balance
                const balance = await contract.balanceOf(notary.wallet_address);
                console.log(`[NTK_MINT_WORKER] Notary ${notary.name} (${notary.wallet_address}) balance: ${ethers.formatUnits(balance, 18)} NTK`);

                if (balance < TARGET_LEVEL) {
                    console.log(`[NTK_MINT_WORKER] 🚀 Topping up ${notary.name}...`);
                    console.log(`[NTK_MINT_WORKER] 📍 Contract: ${ntkAddress}`);
                    console.log(`[NTK_MINT_WORKER] 👤 Recipient: ${notary.wallet_address}`);
                    const tx = await contract.provisionNTK(notary.wallet_address);
                    await tx.wait();
                    console.log(`[NTK_MINT_WORKER] ✅ Top-up complete for ${notary.name} (TX: ${tx.hash})`);
                    try {
                        const { logAction } = require('../utils/logger');
                        logAction(
                            'TOKEN_MINT',
                            `Topped up active notary ${notary.name} (${notary.wallet_address}) daily allocation to 100 NTK.`,
                            'system',
                            { wallet: notary.wallet_address, tx_hash: tx.hash, type: 'daily_topup' }
                        );
                    } catch (e) {
                        console.error("Failed to log mint daily action:", e.message);
                    }
                } else {
                    console.log(`[NTK_MINT_WORKER] ℹ️ ${notary.name} already has sufficient NTK. Skipped.`);
                }
            } catch (err) {
                if (err.message && err.message.includes("Daily NTK already issued")) {
                    console.log(`[NTK_MINT_WORKER] ${notary.wallet_address} protocol limit reached for today. Skipped.`);
                } else {
                    console.error(`[NTK_MINT_WORKER_ERROR] Failed for ${notary.wallet_address}:`, err.message);
                }
            }
        }
        
        console.log("[NTK_MINT_WORKER] Distribution cycle complete.");
    } catch (err) {
        console.error("[NTK_MINT_WORKER_CRITICAL]", err.message);
    }
}

/**
 * 🚀 Instant "Welcome Pack" Trigger
 * Provisions 100 NTK to a new notary if they are fully activated and have 0 balance.
 * @param {number} userId The user ID to verify
 */
async function verifyAndProvisionInitialNTK(userId) {
    try {
        const config = await ConfigService.getConfig();
        const ntkAddress = config.contracts.ntk;
        if (!ntkAddress) return;

        // 🛡️ Fetch authoritative state
        const res = await pool.query(
            "SELECT wallet_address, role, identity_state, role_tx_status FROM users WHERE id = $1",
            [userId]
        );
        
        if (res.rows.length === 0) return;
        const user = res.rows[0];

        // Condition 1: Must be a Notary
        if (user.role !== 'notary') return;

        // Condition 2: Must be ACTIVE in DB and CONFIRMED on-chain
        if (user.identity_state !== 'ACTIVE' || user.role_tx_status !== 'confirmed') {
            console.log(`[NTK_WELCOME] User ${userId} not fully activated yet. Skipping.`);
            return;
        }

        const wallet = await getRelayerWallet();
        const abi = [
            "function balanceOf(address account) view returns (uint256)",
            "function provisionNTK(address notary) external"
        ];
        const contract = new ethers.Contract(ntkAddress, abi, wallet);

        // Condition 3: Must have 0 balance (Old wallets skipped)
        const balance = await contract.balanceOf(user.wallet_address);
        if (balance > 0n) {
            console.log(`[NTK_WELCOME] User ${user.wallet_address} already has NTK. Skipping initial provisioning.`);
            return;
        }

        console.log(`[NTK_WELCOME] 🚀 Provisioning initial 100 NTK for new notary: ${user.wallet_address}`);
        const tx = await contract.provisionNTK(user.wallet_address);
        await tx.wait();
        console.log(`[NTK_WELCOME] ✅ Provisioning successful (TX: ${tx.hash})`);
        try {
            const { logAction } = require('../utils/logger');
            logAction(
                'TOKEN_MINT',
                `Provisioned initial welcome pack of 100 NTK to new active notary ${user.wallet_address}.`,
                'system',
                { wallet: user.wallet_address, tx_hash: tx.hash, type: 'welcome_pack', user_id: userId }
            );
        } catch (e) {
            console.error("Failed to log welcome mint action:", e.message);
        }

    } catch (err) {
        console.error(`[NTK_WELCOME_ERROR] Failed for user ${userId}:`, err.message);
    }
}

module.exports = {
    burnNTKForAction,
    mintDailyNTKForAll,
    verifyAndProvisionInitialNTK
};
