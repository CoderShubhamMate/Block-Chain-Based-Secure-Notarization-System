require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const ProviderService = require('./src/blockchain/provider-service');

async function run() {
    const NOTARY_REGISTRY = '0x1A820f5975dc41c904bF221df342191694Da1f98';
    const NOTARY_WALLET = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;

    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'FIX_NOTARY', route: 'INTERNAL',
                requestId: 'FIX-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const provider = await ProviderService.getProvider();
                const signer = new ethers.Wallet(PK, provider);
                console.log(`Relayer: ${signer.address}`);

                const abi = [
                    "function getUserRole(address) view returns (uint8)",
                    "function assignOwner(address) external",
                    "function promoteToNotary(address) external"
                ];

                const contract = new ethers.Contract(NOTARY_REGISTRY, abi, signer);
                
                const role = Number(await contract.getUserRole(NOTARY_WALLET));
                console.log(`Current Role: ${role}`);

                if (role < 1) {
                    console.log("Step 1: Assigning OWNER role...");
                    const tx1 = await contract.assignOwner(NOTARY_WALLET);
                    console.log(`TX Sent: ${tx1.hash}`);
                    await tx1.wait();
                    console.log("✅ OWNER role assigned.");
                }

                const role2 = Number(await contract.getUserRole(NOTARY_WALLET));
                if (role2 < 2) {
                    console.log("Step 2: Promoting to NOTARY role...");
                    const tx2 = await contract.promoteToNotary(NOTARY_WALLET);
                    console.log(`TX Sent: ${tx2.hash}`);
                    await tx2.wait();
                    console.log("✅ NOTARY role assigned.");
                } else {
                    console.log("✅ User already a NOTARY or higher.");
                }
            });
        } catch (err) {
            console.error('--- ERROR ---');
            console.error(err);
        } finally {
            await pool.end();
        }
    });
}

run().catch(console.error);
