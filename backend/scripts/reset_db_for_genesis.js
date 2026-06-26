const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetDB() {
    console.log("🧹 [GENESIS] Wiping Core Database Tables for True Initial State...");
    try {
        await pool.query(`
            TRUNCATE TABLE users CASCADE;
            TRUNCATE TABLE documents CASCADE;
        `);
        console.log("✅ [GENESIS] Database wiped successfully. System is now a Blank Slate.");
    } catch (e) {
        console.error("❌ [GENESIS] Failed to wipe database:", e);
    } finally {
        await pool.end();
    }
}

resetDB();
