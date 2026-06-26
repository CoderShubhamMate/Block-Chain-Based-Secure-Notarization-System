const { execSync } = require('child_process');
try {
    const diff = execSync('git diff compile_report.js', { encoding: 'utf8' });
    console.log(diff);
} catch (err) {
    console.error(err.message);
}
