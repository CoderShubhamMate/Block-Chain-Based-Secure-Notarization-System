const pool = require('../index');

async function migrate() {
    try {
        // 1. Create auth_nonces table (SENTINEL_3.1 - action-scoped nonces)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth_nonces (
                id              SERIAL PRIMARY KEY,
                wallet_address  VARCHAR(42) NOT NULL,
                nonce           VARCHAR(255) NOT NULL,
                action          VARCHAR(50) NOT NULL DEFAULT 'LOGIN',
                used            BOOLEAN NOT NULL DEFAULT false,
                expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
                issued_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_auth_nonces_wallet_action UNIQUE (wallet_address, action)
            )
        `);

        // 🛡️ [SENTINEL_3.1 PATCH] Guardrail: ADD COLUMN IF NOT EXISTS is idempotent.
        // CREATE TABLE IF NOT EXISTS silently skips columns on pre-existing tables.
        // This ALTER ensures 'used' always exists regardless of table history.
        await pool.query(`
            ALTER TABLE auth_nonces
                ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT false
        `);
        console.log('✅ auth_nonces table created/verified, used column guaranteed present');

        // 2. Create performance indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_auth_nonces_wallet_action
            ON auth_nonces (LOWER(wallet_address), action)
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires
            ON auth_nonces (expires_at)
        `);
        console.log('✅ auth_nonces indexes created');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
