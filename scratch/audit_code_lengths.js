const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

let inCode = false;
let startLine = 0;
let lang = '';

console.log("Analyzing code block lengths in the report...");
lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
        inCode = !inCode;
        if (inCode) {
            startLine = idx + 1;
            lang = line.trim().substring(3);
        } else {
            const length = idx + 1 - startLine;
            console.log(`Code block from line ${startLine} to ${idx + 1} (${lang}): ${length} lines`);
        }
    }
});
