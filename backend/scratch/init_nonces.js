require('dotenv').config();
const db = require('../src/db/index');
db.init();
const pool = db.getPool();

async function run() {
    console.log("🚀 Initializing 'relayer_nonces' table...");
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS relayer_nonces (
                wallet_address TEXT PRIMARY KEY,
                nonce BIGINT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log("✅ Table 'relayer_nonces' created or already exists.");
    } catch (err) {
        console.error("❌ Failed to create table:", err.message);
    } finally {
        await pool.end();
    }
}

run();
