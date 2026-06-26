const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb'
});

async function checkEmailFailures() {
  try {
    const res = await pool.query("SELECT * FROM system_logs WHERE action = 'EMAIL_FAILURE' ORDER BY created_at DESC LIMIT 5");
    console.log("--- 🛡️ FORRENSIC AUDIT: EMAIL FAILURES ---");
    res.rows.forEach(row => {
      console.log(`\n[${row.created_at}] Action: ${row.action}`);
      console.log(`Details: ${row.message}`);
      console.log(`Proof (Metadata): ${JSON.stringify(row.metadata, null, 2)}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkEmailFailures();
