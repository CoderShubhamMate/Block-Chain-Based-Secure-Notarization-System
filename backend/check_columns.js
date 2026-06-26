
const { Pool } = require('pg');
require('dotenv').config();

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  try {
    const res = await pool.query("SELECT * FROM remote_auth_sessions LIMIT 0");
    console.log("Columns:", res.fields.map(f => f.name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
    process.exit();
  }
}
check();
