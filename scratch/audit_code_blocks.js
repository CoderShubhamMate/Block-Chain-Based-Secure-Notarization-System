const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

console.log("Analyzing all code blocks in the markdown report...");
let inCode = false;
let lang = '';
let startLine = 0;
let codeBlocks = [];

lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
        inCode = !inCode;
        if (inCode) {
            lang = line.trim().substring(3).trim();
            startLine = idx + 1;
        } else {
            codeBlocks.push({ lang, startLine, endLine: idx + 1 });
        }
    }
});

console.log(`Found ${codeBlocks.length} code blocks:`);
codeBlocks.forEach((block, idx) => {
    console.log(`Block ${idx + 1}: Language="${block.lang}", Lines ${block.startLine} to ${block.endLine}`);
    // Print first few lines
    const snippet = lines.slice(block.startLine, block.startLine + 3).join('\n');
    console.log("Snippet:\n" + snippet + "\n...");
});
