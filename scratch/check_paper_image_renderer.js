const fs = require('fs');

const path = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_paper.js';
if (!fs.existsSync(path)) {
    console.error("File does not exist:", path);
    process.exit(1);
}

const content = fs.readFileSync(path, 'utf8');
console.log("Does compile_paper.js have renderer.image?", content.includes('renderer.image'));
console.log("Does compile_paper.js have docRenderer.image?", content.includes('docRenderer.image'));
