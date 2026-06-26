const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\Working Proofs\\bbsns_capstone_diagrams.html';
if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Total lines in capstone diagrams:", lines.length);

// Search for any <img> or headings
console.log("\n--- Structural elements inside bbsns_capstone_diagrams.html ---");
let headingCount = 0;
lines.forEach((line, idx) => {
    if (line.includes('<h') || line.includes('img src') || line.includes('class="card"')) {
        headingCount++;
        if (headingCount < 40) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    }
});
console.log(`Total matching elements: ${headingCount}`);
