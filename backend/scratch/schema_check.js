const pool = require('../src/db/index');
const dbContext = require('../src/db/context');
const { ACTOR_IDS } = require('../src/constants/protocol');

async function checkSchema() {
    return dbContext.run({
        actorId: ACTOR_IDS.SYSTEM,
        service: 'STARTUP_GUARD'
    }, async () => {
        try {
            const res = await pool.query(`
                SELECT column_name, is_nullable, column_default, data_type
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND (column_name IN ('phone', 'national_id', 'national_id_hash', 'email', 'identity_state')
                     OR table_name = 'users');
            `);
        console.log("--- DB SCHEMA AUDIT ---");
        console.table(res.rows);
        
        const constraints = await pool.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND contype = 'c';
        `);
        console.log("--- CHECK CONSTRAINTS ---");
        console.table(constraints.rows);

        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
}

checkSchema();
