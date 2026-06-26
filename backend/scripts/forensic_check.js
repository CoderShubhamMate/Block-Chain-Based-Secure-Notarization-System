const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
    console.log("🔍 [FORENSIC] Checking System State...");
    try {
        const u = await pool.query('SELECT COUNT(*) FROM users');
        const c = await pool.query('SELECT config_snapshot FROM system_config WHERE id=1');
        
        console.log("--- RESULTS ---");
        console.log("USER_COUNT:", u.rows[0].count);
        console.log("CONFIG_SNAPSHOT:", JSON.stringify(c.rows[0]?.config_snapshot, null, 2));
        console.log("---------------");
        
    } catch (e) {
        console.error("❌ [FORENSIC] Failed:", e.message);
    } finally {
        await pool.end();
    }
}

check();
