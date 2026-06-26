require('dotenv').config();
const pool = require('../src/db/index');
const dbContext = require('../src/db/context');

async function run() {
    await dbContext.run({}, async () => {
        try {
            await pool.runWithContext({
                userId: 0, reason: 'CHECK_CONFIG', route: 'INTERNAL',
                requestId: 'CONFIG-' + Date.now(), service: 'ADMIN_TOOL', contextType: 'SYSTEM'
            }, async () => {
                const res = await pool.query('SELECT config_snapshot FROM system_config WHERE id = 1');
                console.log(JSON.stringify(res.rows[0].config_snapshot, null, 2));
            });
        } catch (err) {
            console.error(err);
        } finally {
            await pool.end();
        }
    });
}

run().catch(console.error);
