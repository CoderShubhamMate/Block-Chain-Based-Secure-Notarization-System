import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const filePath = path.join(__dirname, "BBSNSMultiSig_ec2.json");
    console.log(`\n🔍 READING COPIED ABI FROM ${filePath}`);
    
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const submitMethods = content.abi.filter(x => x.name === "submitTransaction");
    console.log(`- submitTransaction ABI:`, JSON.stringify(submitMethods, null, 2));
    
    const getTxMethods = content.abi.filter(x => x.name === "getTransaction");
    console.log(`- getTransaction ABI:`, JSON.stringify(getTxMethods, null, 2));

    const getTxCountMethods = content.abi.filter(x => x.name === "getTransactionCount");
    console.log(`- getTransactionCount ABI:`, JSON.stringify(getTxCountMethods, null, 2));
}

main();
