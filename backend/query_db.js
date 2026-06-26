const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb",
});
client.connect()
  .then(() => client.query("SELECT wallet_address, identity_state, role FROM users WHERE LOWER(wallet_address) = LOWER('0x4806A5686c9F6A50f0E6C4c3F656eF4571a0e984');"))
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
    process.exit(1);
  });
