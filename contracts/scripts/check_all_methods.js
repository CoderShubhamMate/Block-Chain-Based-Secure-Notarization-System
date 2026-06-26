import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const filePath = path.join(__dirname, "BBSNSMultiSig_ec2.json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const functionNames = content.abi.filter(x => x.type === "function").map(x => x.name);
    console.log(`\n🔍 FUNCTION NAMES IN DEPLOYED CONTRACT ABI:`);
    console.log(functionNames);
}

main();
