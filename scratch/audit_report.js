const fs = require('fs');
const path = require('path');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Total lines:", lines.length);

// Check 1: search for "reward token"
console.log("\n--- Checking for 'reward token' or similar ---");
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('reward') && (line.toLowerCase().includes('ntk') || line.toLowerCase().includes('token'))) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});

// Check 2: search for NTK (case insensitive)
console.log("\n--- Checking for lowercase 'ntk' ---");
let ntkCount = 0;
lines.forEach((line, idx) => {
    if (line.includes('ntk') || line.includes('NTK') || line.includes('NTKR')) {
        ntkCount++;
        if (ntkCount < 10) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    }
});
console.log(`Total mentions of NTK/NTKR: ${ntkCount}`);

// Check 3: Check for malformed or unclosed elements
console.log("\n--- Checking code block balance ---");
let inCode = false;
let codeStarts = [];
lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
        inCode = !inCode;
        if (inCode) {
            codeStarts.push(idx + 1);
        } else {
            codeStarts.pop();
        }
    }
});
if (inCode) {
    console.log("WARNING: Unclosed code block starting at lines:", codeStarts);
} else {
    console.log("Code blocks are balanced.");
}

// Check 4: Check if there are any raw HTML comments or broken templates
console.log("\n--- Checking for placeholder or template artifacts ---");
lines.forEach((line, idx) => {
    if (line.includes('TODO') || line.includes('PLACEHOLDER') || line.includes('[insert') || line.includes('[Insert') || line.includes('<<')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});

// Check 5: Look for any image references
console.log("\n--- Checking for image references ---");
lines.forEach((line, idx) => {
    if (line.includes('![') || line.includes('<img')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
