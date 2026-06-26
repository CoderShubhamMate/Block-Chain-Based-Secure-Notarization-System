const { Pool } = require('../backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb' });

async function getDocs() {
    try {
        const res = await pool.query(`
            SELECT id, title, filename, file_hash, submission_state, chain_confirmed, approval_tx_hash
            FROM documents
            WHERE is_deleted = false AND (submission_state = 'completed' OR chain_confirmed = true)
            LIMIT 5
        `);
        console.log('Verified/Notarized Documents:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error fetching documents:', err.message);
    } finally {
        await pool.end();
    }
}

getDocs();
