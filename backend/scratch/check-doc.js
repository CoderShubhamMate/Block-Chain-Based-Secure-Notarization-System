require('dotenv').config();
const db = require("./src/db/index");
const dbContext = require("./src/db/context");
const { ACTOR_IDS } = require("./src/constants/protocol");

async function checkData() {
    try {
        db.init();
        await dbContext.run({
            userId: ACTOR_IDS.SYSTEM,
            contextType: 'SYSTEM',
            route: 'INTERNAL_SERVICE'
        }, async () => {
            const result = await db.query("SELECT id, file_hash, idempotency_key, chain_confirmed, tx_status, submission_state FROM documents WHERE id = 12");
            console.log("🔍 DOCUMENT 12 DATA:");
            console.log(JSON.stringify(result.rows[0], null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkData();
