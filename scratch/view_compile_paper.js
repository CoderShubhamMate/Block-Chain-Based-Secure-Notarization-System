const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_paper.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

for (let i = 45; i < 80; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
