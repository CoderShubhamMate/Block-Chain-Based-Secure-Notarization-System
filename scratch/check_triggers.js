const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function check() {
    try {
        console.log('--- TRIGGERS ON users TABLE ---');
        const res = await pool.query(`
            SELECT trigger_name, event_manipulation, action_statement, action_timing
            FROM information_schema.triggers
            WHERE event_object_table = 'users';
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('--- TRIGGERS ON notary_applications TABLE ---');
        const res2 = await pool.query(`
            SELECT trigger_name, event_manipulation, action_statement, action_timing
            FROM information_schema.triggers
            WHERE event_object_table = 'notary_applications';
        `);
        console.log(JSON.stringify(res2.rows, null, 2));
        
        console.log('--- ALL DEFINITIONS OF FUNCTIONS FOR TRIGGERS ---');
        const res3 = await pool.query(`
            SELECT proname, prosrc 
            FROM pg_proc 
            WHERE proname LIKE '%user%' OR proname LIKE '%history%' OR proname LIKE '%notary%'
        `);
        console.log(JSON.stringify(res3.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
