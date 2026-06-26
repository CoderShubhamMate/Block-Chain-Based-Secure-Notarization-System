const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_report.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

console.log("Lines 800 to end of compile_report.js:");
for (let i = 799; i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
