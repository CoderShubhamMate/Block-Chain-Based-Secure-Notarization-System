import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const filePath = path.join(__dirname, "BBSNSMultiSig_ec2.json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const method = content.abi.find(x => x.name === "submitWithSignature");
    console.log(`\n🔍 submitWithSignature ABI:`, JSON.stringify(method, null, 2));
}

main();
