const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_report.js';
if (!fs.existsSync(path)) {
    console.error("File does not exist:", path);
    process.exit(1);
}

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Truncate at line 851 (1-indexed)
const cleanLines = lines.slice(0, 851);
const cleanContent = cleanLines.join('\n');

fs.writeFileSync(path, cleanContent, 'utf8');
console.log("Successfully truncated and cleaned compile_report.js!");
