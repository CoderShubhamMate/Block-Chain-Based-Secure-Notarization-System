const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const { ethers } = require('ethers');
const ConfigService = require('./src/services/config.service');

require('dotenv').config();

// Alternative free BSC Testnet RPC endpoints that may have more generous log limits
const RPC_ENDPOINTS = [
  'https://data-seed-prebsc-2-s1.binance.org:8545',
  'https://data-seed-prebsc-1-s2.binance.org:8545',
  'https://data-seed-prebsc-2-s2.binance.org:8545',
  'https://data-seed-prebsc-1-s3.binance.org:8545',
  'https://bsc-testnet-rpc.publicnode.com',
];

async function tryGetLogs(contractAddress, docHashBytes, fromBlock, toBlock) {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      console.log(`  Trying RPC: ${rpc} | blocks ${fromBlock}-${toBlock}`);
      const logs = await provider.getLogs({ address: contractAddress, fromBlock, toBlock });
      const hit = logs.find(l =>
        l.topics && l.topics.some(t => t && t.toLowerCase().includes(docHashBytes.slice(2).toLowerCase()))
      );
      if (hit) return hit.transactionHash;
      // Also check data field
      const dataHit = logs.find(l => l.data && l.data.toLowerCase().includes(docHashBytes.slice(2).toLowerCase()));
      if (dataHit) return dataHit.transactionHash;
      console.log(`  ✅ Got ${logs.length} logs from ${rpc}, no match.`);
      return null; // Got logs but no match — no need to try other RPCs for same range
    } catch (e) {
      console.warn(`  ⚠️  RPC ${rpc} failed: ${e.message.substring(0, 80)}`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

async function recover() {
  const res = await pool.query(`
    SELECT id, filename, file_hash, tx_hash, approval_tx_hash
    FROM documents
    WHERE chain_confirmed = true
      AND (approval_tx_hash IS NULL OR approval_tx_hash = '' OR NOT (approval_tx_hash ~ '^0x[a-fA-F0-9]{64}$'))
    ORDER BY id
  `);

  console.log(`Found ${res.rows.length} documents to recover.`);
  res.rows.forEach(r => console.log(` - ID:${r.id} | ${r.filename} | tx_hash=${r.tx_hash}`));

  if (res.rows.length === 0) { console.log('Nothing to fix.'); process.exit(0); }

  const config = await ConfigService.getConfig();
  const contractAddress = config.contracts.documentRegistry;

  // Use a provider just to get the current block number
  const baseProvider = new ethers.JsonRpcProvider(config.rpcUrl);
  const currentBlock = await baseProvider.getBlockNumber();
  console.log(`Current block: ${currentBlock}`);

  for (const doc of res.rows) {
    console.log(`\n[RECOVER] Doc ${doc.id} (${doc.filename})`);

    // Fast path
    const badHashes = ['ALREADY_NOTARIZED_SYNC', 'ALREADY_ON_CHAIN', 'PENDING_USER_TX'];
    if (doc.tx_hash && !badHashes.includes(doc.tx_hash)) {
      await pool.query('UPDATE documents SET approval_tx_hash = $1 WHERE id = $2', [doc.tx_hash, doc.id]);
      console.log(`  ✅ Copied tx_hash -> approval_tx_hash`);
      continue;
    }

    const docHashBytes = doc.file_hash.startsWith('0x') ? doc.file_hash : `0x${doc.file_hash}`;

    // The notarization was today, so only search last 10,000 blocks (~8 hours on BSC at 3s/block)
    let recovered = null;
    const CHUNK = 5000;
    const MAX_LOOK_BACK = 1500000; // ~52 days

    for (let to = currentBlock; to > currentBlock - MAX_LOOK_BACK && !recovered; to -= CHUNK) {
      const from = Math.max(0, to - CHUNK);
      recovered = await tryGetLogs(contractAddress, docHashBytes, from, to);
      if (!recovered) await new Promise(r => setTimeout(r, 1500));
    }

    if (recovered) {
      await pool.query(
        "UPDATE documents SET approval_tx_hash = $1, tx_hash = CASE WHEN tx_hash IS NULL OR NOT (tx_hash ~ '^0x[a-fA-F0-9]{64}$') THEN $1 ELSE tx_hash END WHERE id = $2",
        [recovered, doc.id]
      );
      console.log(`  ✅ DB updated with recovered hash: ${recovered}`);
    } else {
      console.log(`  ⚠️  Could not recover hash from any RPC. Tx hash is permanently lost.`);
      console.log(`  📌 You can manually find it by checking BSC Testnet explorer for contract:`);
      console.log(`     https://testnet.bscscan.com/address/${contractAddress}`);
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

dbContext.run({
  actor: 'SYSTEM', actorId: 'RECOVERY_SCRIPT', domain: 'SYSTEM',
  action: 'SYSTEM_MAINTENANCE', requestId: `RECOVER_${Date.now()}`, service: 'BACKFILL'
}, () => {
  pool.init();
  recover().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
});
