const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function check() {
    try {
        console.log('--- FUNCTION fn_identity_lifecycle_steward ---');
        const res = await pool.query(`
            SELECT prosrc 
            FROM pg_proc 
            WHERE proname = 'fn_identity_lifecycle_steward'
        `);
        if (res.rows.length > 0) {
            console.log(res.rows[0].prosrc);
        } else {
            console.log('Not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
