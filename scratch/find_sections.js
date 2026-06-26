const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Listing all headings in BBSNS_Final_Report_v2.md...");
lines.forEach((line, idx) => {
    if (line.trim().startsWith('#') || line.trim().startsWith('##') || line.trim().startsWith('###')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
