const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function check() {
    try {
        console.log('--- USER IN users TABLE ---');
        const res = await pool.query(`
            SELECT * FROM users 
            WHERE wallet_address = '0xa82a6fcbb2db5979a6fcca83c24317605580310e' 
               OR email = 'mateshubham45@gmail.com'
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
