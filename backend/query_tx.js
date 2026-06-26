const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });
async function run() {
  const res = await pool.query("SELECT id, title, tx_hash, approval_tx_hash, chain_confirmed FROM documents ORDER BY created_at DESC LIMIT 5");
  console.table(res.rows);
  process.exit(0);
}
run();
