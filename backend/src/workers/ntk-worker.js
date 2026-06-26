'use strict';

/**
 * NTK Distribution Worker
 */

require('dotenv').config();
const cron = require('node-cron');
const ntkService = require('../services/ntk.service');
const pool = require('../db/index');
const { runWithSystemContext } = require('../middleware/actor');

// Schedule to run every day at midnight (00:00)
const SCHEDULE = process.env.NTK_WORKER_SCHEDULE || '0 0 * * *';

async function start() {
    console.log(`[NTK_WORKER] NTK Distribution Worker is DISABLED for V2 (Auto-Refill On-Chain).`);
    // Worker disabled.
}

// Run standalone if invoked directly by PM2
if (require.main === module) {
    (async () => {
        try {
            await pool.init();
            start();
        } catch (err) {
            console.error("[NTK_WORKER_FATAL] Failed to initialize database:", err.message);
            process.exit(1);
        }
    })();
}

module.exports = { start };
