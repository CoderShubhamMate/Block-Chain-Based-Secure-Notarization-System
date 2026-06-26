const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'bbsns', password: 'password', port: 5432 });
pool.query("SELECT role FROM users WHERE LOWER(wallet_address) = LOWER('0xF75F20DE900233153795CF8F7e7350DCfD04dd35')")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(console.error);
