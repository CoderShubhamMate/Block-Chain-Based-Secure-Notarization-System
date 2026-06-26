require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/db/index');
const dbContext = require('../src/db/context');

async function migrate() {
    console.log("Starting State-Gap Migration for Rejection Logic...");
    
    pool.init();
    
    try {
        await pool.runWithContext({
            userId: 0,
            reason: 'STATE_GAP_MIGRATION',
            route: 'MIGRATION_SCRIPT',
            service: 'BACKGROUND_WORKER',
            contextType: 'SYSTEM'
        }, async (client) => {
            await client.query('BEGIN');
            
            // 1. Set needs_cleanup = true for all rejected documents
            const docsRes = await client.query(`
                UPDATE documents 
                SET needs_cleanup = true 
                WHERE status = 'rejected' AND needs_cleanup = false
                RETURNING id
            `);
            console.log(`Updated ${docsRes.rowCount} rejected documents to needs_cleanup = true.`);
            
            // 2. Set identity_state = 'REJECTED' for users tied to rejected applications
            const usersRes = await client.query(`
                UPDATE users u
                SET identity_state = 'REJECTED',
                    role = CASE WHEN role = 'notary' THEN 'user' ELSE role END
                FROM notary_applications na
                WHERE (u.id = na.user_id OR LOWER(u.wallet_address) = LOWER(na.wallet_address))
                  AND na.status = 'rejected'
                  AND (u.identity_state != 'REJECTED' OR u.role = 'notary')
                RETURNING u.id
            `);
            console.log(`Updated ${usersRes.rowCount} users tied to rejected notary applications.`);
            
            await client.query('COMMIT');
            console.log("Migration completed successfully.");
        });
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

dbContext.run({ requestId: 'MIGRATE-REJECTION', domain: 'SYSTEM', timestamp: new Date() }, migrate);
