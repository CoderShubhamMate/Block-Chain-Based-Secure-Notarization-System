const { Pool } = require('pg');
require('dotenv').config();

async function checkEnums() {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'notarydb',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        const res = await pool.query(`
            SELECT e.enumlabel
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'proposal_status'
        `);
        console.log('Values for proposal_status:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking enums:', err.message);
    } finally {
        await pool.end();
    }
}

checkEnums();
