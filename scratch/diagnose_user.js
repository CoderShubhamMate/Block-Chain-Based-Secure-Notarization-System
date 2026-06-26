const { Pool } = require('/home/ubuntu/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb' });

async function getColumns(tableName) {
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
    `, [tableName]);
    return res.rows.map(r => r.column_name);
}

async function runDiagnostics() {
    try {
        console.log('--- START DIAGNOSTIC AUDIT ---');

        // 1. Users table
        console.log('\n--- 1. USERS TABLE SCHEMA & DATA ---');
        const userCols = await getColumns('users');
        console.log('Columns:', userCols.join(', '));
        const userRes = await pool.query(`
            SELECT * FROM users 
            WHERE wallet_address = '0xa82a6fcbb2db5979a6fcca83c24317605580310e' 
               OR email = 'mateshubham45@gmail.com'
        `);
        console.log('Data:', JSON.stringify(userRes.rows, null, 2));

        if (userRes.rows.length === 0) {
            console.log('User not found in users table.');
            return;
        }
        const userId = userRes.rows[0].id;
        const wallet = userRes.rows[0].wallet_address;

        // 2. Notary Applications table
        console.log('\n--- 2. NOTARY APPLICATIONS ---');
        const notCols = await getColumns('notary_applications');
        console.log('Columns:', notCols.join(', '));
        const notRes = await pool.query(`
            SELECT * FROM notary_applications 
            WHERE wallet_address = $1 OR email = 'mateshubham45@gmail.com'
        `, [wallet]);
        console.log('Data:', JSON.stringify(notRes.rows, null, 2));

        // 3. User State History table
        console.log('\n--- 3. USER STATE HISTORY ---');
        const historyCols = await getColumns('user_state_history');
        console.log('Columns:', historyCols.join(', '));
        const historyRes = await pool.query(`
            SELECT * FROM user_state_history 
            WHERE user_id = $1
            ORDER BY id ASC
        `, [userId]);
        console.log('Data:', JSON.stringify(historyRes.rows, null, 2));

        // 4. Governance Proposals
        console.log('\n--- 4. GOVERNANCE PROPOSALS ---');
        const govCols = await getColumns('governance_proposals');
        console.log('Columns:', govCols.join(', '));
        
        // Find proposals involving this wallet or user id
        const govRes = await pool.query(`
            SELECT * FROM governance_proposals
            ORDER BY id DESC
        `);
        console.log('All proposals:', JSON.stringify(govRes.rows, null, 2));

        // 5. Governance Votes
        console.log('\n--- 5. GOVERNANCE VOTES ---');
        const voteCols = await getColumns('governance_votes');
        console.log('Columns:', voteCols.join(', '));
        const voteRes = await pool.query(`
            SELECT * FROM governance_votes
            WHERE voter = $1 OR voter = '0xa82a6fcbb2db5979a6fcca83c24317605580310e'
        `, [wallet]);
        console.log('Votes by user:', JSON.stringify(voteRes.rows, null, 2));

        // 6. Role Sync Events if any
        if (await getColumns('user_sync_events')) {
            console.log('\n--- 6. USER SYNC EVENTS ---');
            const syncRes = await pool.query(`
                SELECT * FROM user_sync_events
                WHERE wallet_address = $1
                ORDER BY id DESC
            `, [wallet]);
            console.log('Sync Events:', JSON.stringify(syncRes.rows, null, 2));
        }

    } catch (err) {
        console.error('Error during diagnostics:', err);
    } finally {
        await pool.end();
        console.log('\n--- END DIAGNOSTIC AUDIT ---');
    }
}

runDiagnostics();
