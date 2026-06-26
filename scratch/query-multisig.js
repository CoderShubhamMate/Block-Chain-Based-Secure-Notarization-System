require('dotenv').config();
const { ethers } = require('ethers');
const pool = require('../backend/src/db/index');
const ConfigService = require('../backend/src/services/config.service');
const dbContext = require('../backend/src/db/context');

async function main() {
  pool.init();
  
  await dbContext.run({}, async () => {
    await pool.runWithContext({ userId: 0, reason: 'CLI Inspect', contextType: 'SYSTEM' }, async (client) => {
      const config = await ConfigService.getConfig();
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const abi = require('../backend/src/artifacts/BBSNSMultiSig.json').abi;
      const contract = new ethers.Contract(config.contracts.multisig, abi, provider);
      
      const count = await contract.getTransactionCount();
      console.log('Total transactions on contract:', count.toString());
      
      for (let i = 0; i < count; i++) {
        const tx = await contract.getTransaction(i);
        console.log(`Tx #${i}:`, {
          to: tx[0],
          value: tx[1].toString(),
          data: tx[2],
          executed: tx[3],
          confirmations: tx[4].toString()
        });
      }
    });
  });
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
