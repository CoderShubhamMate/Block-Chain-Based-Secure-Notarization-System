import fs from "fs";
import path from "path";

const appPath = "C:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/Frontend Desktop Application/Remote Auth/src/App.tsx";

console.log("Loading App.tsx from:", appPath);
let content = fs.readFileSync(appPath, "utf-8");

// Find the gov-execute block and replace txHash: tx.hash
const regex = /(if\s*\(\s*activeMode\s*===\s*"gov-execute"\s*&&[\s\S]*?body:\s*JSON\.stringify\(\{[\s\S]*?txHash:\s*)tx\.hash(,[\s\S]*?\}\)[\s\S]*?\}\s*catch)/g;

if (regex.test(content)) {
    console.log("Found gov-execute block! Replacing tx.hash with txHashToSubmit...");
    content = content.replace(regex, "$1txHashToSubmit$2");
    fs.writeFileSync(appPath, content, "utf-8");
    console.log("App.tsx updated successfully!");
} else {
    console.error("Could not find matching gov-execute block in App.tsx!");
}
