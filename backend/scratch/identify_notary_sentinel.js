const pool = require('../src/db/index');
const { ACTOR_IDS } = require('../src/constants/protocol');

async function run() {
  try {
    await pool.runWithContext({
      userId: ACTOR_IDS.SYSTEM,
      reason: 'DEBUG_IDENTIFY_NOTARY',
      route: 'INTERNAL',
      requestId: 'DEBUG-' + Date.now(),
      service: 'DEBUG_TOOL',
      contextType: 'SYSTEM'
    }, async (client) => {
      console.log('--- RECENT NOTARIES ---');
      const res = await client.query(`
        SELECT id, name, email, wallet_address, role, identity_state, role_tx_status, updated_at 
        FROM users 
        WHERE role = 'notary' 
        ORDER BY updated_at DESC 
        LIMIT 10
      `);
      
      res.rows.forEach(u => {
        console.log(`[${u.id}] ${u.name} (${u.email}) | Wallet: ${u.wallet_address} | Role: ${u.role} | State: ${u.identity_state} | TxStatus: ${u.role_tx_status} | Updated: ${u.updated_at}`);
      });

      console.log('\n--- RECENT APPLICATIONS ---');
      const appRes = await client.query(`
        SELECT id, full_name, email, wallet_address, status, is_activated, updated_at 
        FROM notary_applications 
        ORDER BY updated_at DESC 
        LIMIT 10
      `);
      
      appRes.rows.forEach(a => {
        console.log(`[${a.id}] ${a.full_name} (${a.email}) | Wallet: ${a.wallet_address} | Status: ${a.status} | Activated: ${a.is_activated} | Updated: ${a.updated_at}`);
      });
    });
  } catch (err) {
    console.error('--- ERROR ---');
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
