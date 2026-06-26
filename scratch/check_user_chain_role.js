const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function check() {
    try {
        console.log('--- GOVERNANCE PROPOSALS ---');
        const res = await pool.query('SELECT * FROM governance_proposals');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error running check:', err);
    } finally {
        await pool.end();
    }
}

check();
