require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const ProviderService = require('./src/blockchain/provider-service');

async function run() {
    const NTK_TOKEN = '0x0d92A3De88202C929714df9cB24395CF4C15ba2e';
    const NOTARY_WALLET = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;

    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'MINT_NTK_FUEL', route: 'INTERNAL',
                requestId: 'MINT-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const provider = await ProviderService.getProvider();
                const signer = new ethers.Wallet(PK, provider);
                console.log(`Relayer: ${signer.address}`);

                const ntkIface = [
                    "function mintDailyNTK(address notary) external",
                    "function balanceof(address account) view returns (uint256)",
                    "function symbol() view returns (string)",
                    "function decimals() view returns (uint8)"
                ];
                
                // Note: Standard ERC20 is balanceOf (case sensitive)
                const ntkContract = new ethers.Contract(NTK_TOKEN, [
                    "function mintDailyNTK(address notary) external",
                    "function balanceOf(address account) view returns (uint256)",
                    "function symbol() view returns (string)",
                    "function decimals() view returns (uint8)"
                ], signer);

                const balance = await ntkContract.balanceOf(NOTARY_WALLET);
                const symbol = await ntkContract.symbol();
                const decimals = await ntkContract.decimals();
                
                console.log(`Current Balance for ${NOTARY_WALLET}: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

                if (balance > ethers.parseUnits("1", decimals)) {
                    console.log("✅ User already has fuel.");
                    // return; // Continue anyway to ensure daily mint works
                }

                console.log(`🚀 Minting Daily NTK allocation (100 ${symbol})...`);
                const tx = await ntkContract.mintDailyNTK(NOTARY_WALLET);
                console.log(`   - Transaction broadcast: ${tx.hash}`);
                await tx.wait();
                console.log(`✅ Minting complete.`);

                const finalBalance = await ntkContract.balanceOf(NOTARY_WALLET);
                console.log(`New Balance: ${ethers.formatUnits(finalBalance, decimals)} ${symbol}`);
            });
        } catch (err) {
            console.error('--- ERROR ---');
            console.error(err);
            if (err.message.includes("Daily NTK already issued")) {
                console.log("ℹ️ Daily allocation was already issued today.");
            }
        } finally {
            await pool.end();
        }
    });
}

run().catch(console.error);
