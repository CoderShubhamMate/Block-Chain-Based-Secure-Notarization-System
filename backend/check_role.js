const dbProxy = require('./src/db/index');
async function check() {
  const res = await dbProxy.query("SELECT id, role, identity_state, wallet_address FROM users WHERE name ILIKE '%shubham%'");
  console.log('User status in DB:', res.rows);
  if (res.rows.length > 0) {
     const user = res.rows[0];
     if (user.role === 'admin') {
         console.log('User is stuck as admin in DB. Downgrading to user...');
         await dbProxy.query("UPDATE users SET role = 'user' WHERE id = $1", [user.id]);
         console.log('Done.');
     }
  }
  process.exit(0);
}
check().catch(console.error);
