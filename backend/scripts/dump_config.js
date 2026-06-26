const pool = require('../src/db/index');
const config = require('../src/services/config.service');

async function main() {
    await pool.init();
    const c = await config.getConfig();
    console.log(JSON.stringify(c, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
