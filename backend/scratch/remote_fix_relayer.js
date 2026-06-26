require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const ProviderService = require('./src/blockchain/provider-service');

async function run() {
    const NOTARY_REGISTRY = '0x1A820f5975dc41c904bF221df342191694Da1f98';
    const MULTISIG = '0xED1873d82766D61D3A5564A62b71C6DCc1403366';
    const PK = process.env.BNB_SYSTEM_PRIVATE_KEY;

    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'SET_RELAYER', route: 'INTERNAL',
                requestId: 'RELAYER-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const provider = await ProviderService.getProvider();
                const signer = new ethers.Wallet(PK, provider);
                const relayer = signer.address;
                console.log(`Relayer to set: ${relayer}`);

                const registryIface = new ethers.Interface([
                    "function updateRelayer(address) external"
                ]);

                const msArtifact = require('./src/artifacts/BBSNSMultiSig.json');
                const msContract = new ethers.Contract(MULTISIG, msArtifact.abi, signer);

                const callData = registryIface.encodeFunctionData('updateRelayer', [relayer]);
                const proposalHash = ethers.id(`updateRelayer-${Date.now()}`);
                
                console.log(`Submitting updateRelayer to MultiSig...`);
                const tx1 = await msContract.submitTransaction(NOTARY_REGISTRY, 0, callData, proposalHash);
                const receipt1 = await tx1.wait();
                
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
                console.log(`Transaction Index: ${txIndex}`);

                console.log(`Executing transaction...`);
                const tx2 = await msContract.executeTransaction(txIndex);
                await tx2.wait();
                console.log(`✅ Relayer updated on-chain.`);
            });
        } catch (err) {
            console.error(err);
        } finally {
            await pool.end();
        }
    });
}

run().catch(console.error);
