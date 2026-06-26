require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const ProviderService = require('./src/blockchain/provider-service');

async function run() {
    const NTK_TOKEN = '0x0d92A3De88202C929714df9cB24395CF4C15ba2e';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;

    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'GRANT_RELAYER_ROLE', route: 'INTERNAL',
                requestId: 'GRANT-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const provider = await ProviderService.getProvider();
                const signer = new ethers.Wallet(PK, provider);
                const relayer = signer.address;
                const RELAYER_ROLE = ethers.id("RELAYER_ROLE");
                
                const ntk = new ethers.Contract(NTK_TOKEN, [
                    "function grantRole(bytes32 role, address account) external",
                    "function hasRole(bytes32 role, address account) view returns (bool)"
                ], signer);

                console.log(`Granting RELAYER_ROLE to ${relayer}...`);
                const tx = await ntk.grantRole(RELAYER_ROLE, relayer);
                console.log(`Transaction broadcast: ${tx.hash}`);
                await tx.wait();
                console.log(`✅ Role granted.`);

                const hasRole = await ntk.hasRole(RELAYER_ROLE, relayer);
                console.log(`Final check: Has RELAYER_ROLE? ${hasRole}`);
            });
        } catch (err) {
            console.error(err);
        } finally {
            await pool.end();
        }
    });
}

run().catch(console.error);
