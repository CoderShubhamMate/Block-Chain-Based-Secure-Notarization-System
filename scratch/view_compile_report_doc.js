const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_report.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

for (let i = 640; i < 675; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
