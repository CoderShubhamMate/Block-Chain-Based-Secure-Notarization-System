const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Searching for png or diagram or image keywords...");
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('.png') || line.toLowerCase().includes('working proofs') || line.toLowerCase().includes('figure')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
