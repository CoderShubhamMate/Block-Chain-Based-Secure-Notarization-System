const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb'
});

async function checkNotaries() {
  try {
    const res = await pool.query("SELECT id, name, email, wallet_address, role, identity_state FROM users WHERE role = 'notary'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkNotaries();
