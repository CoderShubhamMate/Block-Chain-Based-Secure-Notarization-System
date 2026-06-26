require('dotenv').config();
const pool = require('./src/db/index');
const dbContext = require('./src/db/context');
const { ACTOR_IDS } = require('./src/constants/protocol');
const fs = require('fs');
const path = require('path');

async function runBackup() {
    console.log("   - Connecting to database...");
    pool.init();
    
    // Initialize root AsyncLocalStorage context
    dbContext.run({
        requestId: 'BACKUP-' + Date.now(),
        service: 'BACKUP_UTILITY'
    }, async () => {
        try {
            const backupData = await pool.runWithContext({
                userId: ACTOR_IDS.SYSTEM,
                reason: 'PRE_PATCH_SYSTEM_BACKUP',
                service: 'BACKUP_UTILITY'
            }, async (client) => {
                const applications = await client.query("SELECT * FROM notary_applications");
                const systemConfig = await client.query("SELECT * FROM system_config");
                return {
                    timestamp: new Date().toISOString(),
                    notary_applications: applications.rows,
                    system_config: systemConfig.rows
                };
            });
            
            const backupPath = path.join(__dirname, 'pre_patch_backup.json');
            fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
            
            console.log(`   ✅ Backup successful! Saved ${backupData.notary_applications.length} applications and ${backupData.system_config.length} config rows to: ${backupPath}`);
            process.exit(0);
        } catch (err) {
            console.error("❌ Backup failed:", err.stack || err.message || err);
            process.exit(1);
        }
    });
}

runBackup();
