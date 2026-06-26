const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function check() {
    try {
        console.log('Connecting to database...');
        const res = await pool.query(`
            SELECT id, username, email, role, wallet_address, created_at
            FROM users
            ORDER BY role, id
        `);
        
        console.log('\n--- ALL USERS IN DATABASE ---');
        const counts = {};
        res.rows.forEach(u => {
            const r = u.role ? u.role.toLowerCase() : 'null';
            counts[r] = (counts[r] || 0) + 1;
            console.log(`ID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role} | Wallet: ${u.wallet_address}`);
        });
        
        console.log('\n--- ROLE COUNTS ---');
        console.log(counts);
        
    } catch (err) {
        console.error('Check failed with error:');
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
