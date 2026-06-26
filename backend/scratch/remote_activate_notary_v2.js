const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const { registerNotaryOnChain } = require('./src/blockchain/notary-registry');

async function run() {
    const notary = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    
    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0,
                reason: 'ON_CHAIN_ACTIVATION',
                route: 'INTERNAL',
                requestId: 'ACTIVATE-' + Date.now(),
                service: 'ADMIN_TOOL',
                contextType: 'SYSTEM'
            }, async () => {
                console.log(`Activating notary: ${notary}`);
                const result = await registerNotaryOnChain(notary);
                console.log('Result:', result);
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
