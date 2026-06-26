const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5433/notarydb' });

async function fix() {
  const res = await pool.query("SELECT id, on_chain_data FROM governance_proposals WHERE on_chain_data LIKE '[%'");
  for (let row of res.rows) {
      try {
          const parsed = JSON.parse(row.on_chain_data);
          if (parsed && parsed.length === 1 && parsed[0].data) {
              const newData = parsed[0].data;
              await pool.query("UPDATE governance_proposals SET on_chain_data = $1 WHERE id = $2", [newData, row.id]);
              console.log(`Updated proposal ${row.id}`);
          }
      } catch (e) {
          console.error(e);
      }
  }
  process.exit(0);
}
fix();
