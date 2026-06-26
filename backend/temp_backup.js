const path = require('path');
const fs = require('fs');
const db = require('./src/db/index.js');
const dbContext = require('./src/db/context.js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { ACTOR_IDS } = require('./src/constants/protocol');

async function backupTable() {
    // 🛡️ [RESILIENCE] Manually enter the AsyncLocalStorage context
    // This replicates the root middleware behavior for standalone scripts.
    await dbContext.run({}, async () => {
        try {
            console.log("Initializing DB Pool with Manual Context Entry...");
            db.init();

            await db.runWithContext({
                userId: ACTOR_IDS.SYSTEM,
                reason: 'SAFE_BACKUP_EXECUTION',
                contextType: 'SYSTEM',
                service: 'BACKUP_SERVICE'
            }, async (auditClient) => {
                console.log("Starting secure export of notary_applications...");
                const res = await auditClient.query("SELECT * FROM notary_applications");
                const data = res.rows;

                const backupDir = path.join(__dirname, 'backups');
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFile = path.join(backupDir, `notary_applications_manual_backup_${timestamp}.json`);

                fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
                console.log(`✅ Backup successful: ${backupFile}`);
                console.log(`Total records backed up: ${data.length}`);
            });

        } catch (err) {
            console.error("❌ Backup failed:", err);
            process.exit(1);
        } finally {
            await db.end();
        }
    });
}

backupTable();
