const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb'
});

async function checkLogs() {
  try {
    const res = await pool.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 20');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkLogs();
