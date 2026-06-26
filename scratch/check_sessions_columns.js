const { Pool } = require('c:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb' });

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'remote_auth_sessions'
        `);
        console.log('--- remote_auth_sessions schema ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Failed to get schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
