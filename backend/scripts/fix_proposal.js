require('dotenv').config({path: '/home/ubuntu/backend/.env'});
const pool = require('/home/ubuntu/backend/src/db/index.js');
pool.query("UPDATE governance_proposals SET status = 'passed' WHERE id = 1 AND status = 'active'").then(r => {
    console.log('Fixed', r.rowCount);
    process.exit(0);
}).catch(console.error);
