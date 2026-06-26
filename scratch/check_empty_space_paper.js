const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Research_Paper.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Analyzing consecutive empty lines in the research paper...");
let emptyCount = 0;
let emptyStart = 0;

lines.forEach((line, idx) => {
    if (line.trim() === '') {
        if (emptyCount === 0) {
            emptyStart = idx + 1;
        }
        emptyCount++;
    } else {
        if (emptyCount >= 3) {
            console.log(`Found ${emptyCount} empty lines from line ${emptyStart} to ${idx}`);
            // Print context
            console.log(`Context before: "${lines[emptyStart - 2].trim()}"`);
            console.log(`Context after: "${lines[idx].trim()}"`);
            console.log("------------------------");
        }
        emptyCount = 0;
    }
});
