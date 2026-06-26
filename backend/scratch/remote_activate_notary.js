const { registerNotaryOnChain } = require('./src/blockchain/notary-registry');

async function run() {
    const notary = '0xa82a6fcbb2db5979a6fcca83c24317605580310e';
    console.log(`Activating notary: ${notary}`);
    const result = await registerNotaryOnChain(notary);
    console.log('Result:', result);
}

run().catch(console.error);
