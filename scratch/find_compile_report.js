const fs = require('fs');
const path = require('path');

function searchFile(dir, fileName) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
                    results = results.concat(searchFile(filePath, fileName));
                }
            } else if (file === fileName) {
                results.push(filePath);
            }
        });
    } catch (e) {}
    return results;
}

const root = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro';
console.log("Searching for other copies of compile_report.js under:", root);
const copies = searchFile(root, 'compile_report.js');
console.log("Found copies:", copies);
