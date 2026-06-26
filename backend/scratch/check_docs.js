
require('dotenv').config();
const db = require('../src/db/index');
db.init();
const pool = db.getPool();

async function run() {
    try {
        const res = await pool.query("SELECT id, submission_state, tx_status, tx_hash, last_error FROM documents ORDER BY updated_at DESC LIMIT 5;");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
