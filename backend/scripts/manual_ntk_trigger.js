const ntk = require('../src/services/ntk.service');

async function main() {
    console.log("🚀 Starting Manual NTK Distribution...");
    await ntk.mintDailyNTKForAll();
    console.log("✅ Manual Distribution Task Finished.");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ CRITICAL ERROR:", err);
    process.exit(1);
});
