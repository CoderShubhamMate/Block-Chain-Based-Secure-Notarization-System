const pg = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
    console.log(`\n🔍 QUERYING DATABASE STATE`);
    console.log(`- DB URL: ${process.env.DATABASE_URL}`);
    
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        const proposals = await pool.query("SELECT * FROM governance_proposals ORDER BY id DESC LIMIT 5");
        console.log(`\n- Last 5 Governance Proposals:`);
        for (const p of proposals.rows) {
            console.log(`  - ID: ${p.id}`);
            console.log(`    - Title: ${p.title}`);
            console.log(`    - Type: ${p.type}`);
            console.log(`    - Status: ${p.status}`);
            console.log(`    - Target: ${p.target_address}`);
            console.log(`    - Calldata: ${p.calldata}`);
            console.log(`    - Onchain ID: ${p.onchain_id}`);
            console.log(`    - Tx Hash: ${p.tx_hash}`);
        }
        
        const sessions = await pool.query("SELECT * FROM remote_auth_sessions ORDER BY created_at DESC LIMIT 5");
        console.log(`\n- Last 5 Remote Auth Sessions:`);
        for (const s of sessions.rows) {
            console.log(`  - SessionID: ${s.session_id}`);
            console.log(`    - Mode: ${s.mode}`);
            console.log(`    - Status: ${s.status}`);
            console.log(`    - ProposalID: ${s.proposal_id}`);
            console.log(`    - TxIndex: ${s.tx_index}`);
            console.log(`    - WalletAddress: ${s.wallet_address}`);
        }
    } catch (err) {
        console.error("❌ Database query failed:", err.message);
    } finally {
        await pool.end();
    }
}

main();
