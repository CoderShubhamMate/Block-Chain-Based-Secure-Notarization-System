const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_report.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

console.log("Total lines:", lines.length);
console.log("Line 845 to 855:");
for (let i = 844; i < 855; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
