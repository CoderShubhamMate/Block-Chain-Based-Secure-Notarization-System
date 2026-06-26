const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

console.log('--- 🛡️ BBSNS PRE-FLIGHT VALIDATOR ---');
console.log(`Auditing: ${targetDir}`);

const files = walk(targetDir);
let errors = 0;

for (const file of files) {
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    try {
        // node --check validates syntax without executing the code
        execSync(`node --check "${file}"`, { stdio: 'ignore' });
        console.log(`✅ ${relativePath}`);
    } catch (err) {
        console.error(`❌ STOPSHIP: Syntax Error in ${relativePath}`);
        errors++;
        process.exit(1); // Fail fast on first error
    }
}

if (errors === 0) {
    console.log('\n✨ Validation Complete: All files are syntactically sound.');
    process.exit(0);
}
