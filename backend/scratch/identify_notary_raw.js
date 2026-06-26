const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    console.log('--- RECENT NOTARIES ---');
    const res = await client.query(`
      SELECT id, name, email, wallet_address, role, identity_state, role_tx_status, updated_at 
      FROM users 
      WHERE role = 'notary' OR role = '3'
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

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
