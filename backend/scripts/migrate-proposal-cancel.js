const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'notarydb',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        console.log('🚀 Starting DB migration for proposal status...');
        
        // Add 'cancelled' to proposal_status enum
        // Note: IF NOT EXISTS is not supported for ADD VALUE in some PG versions, 
        // so we check if it exists first or just try-catch.
        try {
            await pool.query(`ALTER TYPE proposal_status ADD VALUE 'cancelled'`);
            console.log('✅ Added "cancelled" to proposal_status enum.');
        } catch (e) {
            if (e.code === '42710') {
                console.log('ℹ️ "cancelled" value already exists in enum.');
            } else {
                throw e;
            }
        }

        console.log('✨ Migration completed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
