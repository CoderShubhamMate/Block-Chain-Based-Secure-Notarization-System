require('dotenv').config();
const db = require("./src/db/index");
const dbContext = require("./src/db/context");
const { ACTOR_IDS } = require("./src/constants/protocol");

async function fixData() {
    try {
        console.log("🛠️ Starting Secure Database Repair...");
        
        // 1. Initialize the DB Pool
        db.init();

        // 2. Run inside the authoritative System Context
        await dbContext.run({
            userId: ACTOR_IDS.SYSTEM,
            contextType: 'SYSTEM',
            route: 'INTERNAL_SERVICE',
            requestId: 'REPAIR_TASK_' + Date.now()
        }, async () => {
            const result = await db.query(`
                UPDATE documents 
                SET idempotency_key = file_hash, 
                    submission_state = 'submitted_to_blockchain',
                    updated_at = NOW() 
                WHERE idempotency_key = 'file_hash' OR (chain_confirmed = true AND submission_state = 'pending')
                RETURNING id, file_hash
            `);

            console.log(`✅ Repaired ${result.rowCount} documents.`);
            result.rows.forEach(row => {
                console.log(`   - Fixed Doc ID: ${row.id} -> Hash: ${row.file_hash}`);
            });
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Repair Failed:", err);
        process.exit(1);
    }
}

fixData();
