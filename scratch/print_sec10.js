const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Printing lines from Section 10.4 to end of Chapter 10...");
let start = -1;
let end = -1;

lines.forEach((line, idx) => {
    if (line.includes('## 10.4')) {
        start = idx;
    }
    if (line.includes('# Chapter 11')) {
        end = idx;
    }
});

if (start !== -1 && end !== -1) {
    for (let i = start; i < end; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
    }
} else {
    console.log("Could not find boundaries", {start, end});
}
