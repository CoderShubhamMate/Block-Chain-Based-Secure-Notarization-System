const { pool } = require('./src/utils/db');
async function run() {
  const res = await pool.query('SELECT id, wallet_address, role, name, identity_state FROM users');
  console.log(res.rows);
  process.exit(0);
}
run().catch(console.error);
