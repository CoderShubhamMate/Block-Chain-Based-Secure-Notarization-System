const fs = require("fs");
const path = require("path");

function searchFolder(dir, pattern) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFolder(fullPath, pattern);
        } else if (file.endsWith(".js")) {
            const content = fs.readFileSync(fullPath, "utf8");
            if (pattern.test(content)) {
                console.log(`Found pattern in: ${fullPath}`);
                const lines = content.split("\n");
                lines.forEach((line, idx) => {
                    if (pattern.test(line)) {
                        console.log(`  L${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchFolder(path.join(__dirname, "src"), /NotaryRegistry/i);
