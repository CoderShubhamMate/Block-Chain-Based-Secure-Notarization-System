require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const ProviderService = require('./src/blockchain/provider-service');

async function run() {
    const NOTARY_REGISTRY = '0x1A820f5975dc41c904bF221df342191694Da1f98';
    const MULTISIG = '0xED1873d82766D61D3A5564A62b71C6DCc1403366';
    const NOTARY_WALLET = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;

    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'FIX_NOTARY_MULTISIG', route: 'INTERNAL',
                requestId: 'FIX-MS-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const provider = await ProviderService.getProvider();
                const signer = new ethers.Wallet(PK, provider);
                console.log(`Relayer: ${signer.address}`);

                const registryIface = new ethers.Interface([
                    "function promoteToNotary(address) external",
                    "function getUserRole(address) view returns (uint8)",
                    "function assignOwner(address) external"
                ]);

                const msArtifact = require('./src/artifacts/BBSNSMultiSig.json');
                const msContract = new ethers.Contract(MULTISIG, msArtifact.abi, signer);

                const currentRole = Number(await new ethers.Contract(NOTARY_REGISTRY, registryIface, provider).getUserRole(NOTARY_WALLET));
                console.log(`Current Role: ${currentRole}`);

                if (currentRole >= 2) {
                    console.log("✅ Already a Notary.");
                    return;
                }

                // Prepare calls
                const calls = [];
                if (currentRole < 1) {
                    calls.push({
                        name: 'assignOwner',
                        data: registryIface.encodeFunctionData('assignOwner', [NOTARY_WALLET])
                    });
                }
                calls.push({
                    name: 'promoteToNotary',
                    data: registryIface.encodeFunctionData('promoteToNotary', [NOTARY_WALLET])
                });

                for (const call of calls) {
                    console.log(`Step: ${call.name}`);
                    const proposalHash = ethers.id(`${call.name}-${Date.now()}`);
                    
                    console.log(`   - Submitting transaction to MultiSig...`);
                    const tx1 = await msContract.submitTransaction(NOTARY_REGISTRY, 0, call.data, proposalHash);
                    const receipt1 = await tx1.wait();
                    console.log(`   ✅ Submitted: ${tx1.hash}`);

                    // Find txIndex
                    let txIndex;
                    for (const log of receipt1.logs) {
                        try {
                            const parsed = msContract.interface.parseLog(log);
                            if (parsed.name === 'TransactionSubmitted') {
                                txIndex = parsed.args.txIndex;
                                break;
                            }
                        } catch (e) {}
                    }
                    console.log(`   - Transaction Index: ${txIndex}`);

                    console.log(`   - Executing transaction...`);
                    const tx2 = await msContract.executeTransaction(txIndex);
                    await tx2.wait();
                    console.log(`   ✅ Executed: ${tx2.hash}`);
                }

                const finalRole = Number(await new ethers.Contract(NOTARY_REGISTRY, registryIface, provider).getUserRole(NOTARY_WALLET));
                console.log(`Final Role: ${finalRole}`);
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
