const fs = require("fs");
const path = require("path");

function checkAbi(filePath, label) {
    console.log(`=== checking ABI: ${label} ===`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const abi = data.abi;
        
        const submitTx = abi.find(x => x.name === "submitTransaction");
        const submitSig = abi.find(x => x.name === "submitWithSignature");
        const getTx = abi.find(x => x.name === "getTransaction");
        
        if (submitTx) {
            console.log("submitTransaction inputs:");
            submitTx.inputs.forEach(input => {
                console.log(`  - ${input.name}: ${input.type}`);
            });
        } else {
            console.log("submitTransaction not found");
        }
        
        if (submitSig) {
            console.log("submitWithSignature inputs:");
            submitSig.inputs.forEach(input => {
                console.log(`  - ${input.name}: ${input.type}`);
            });
        } else {
            console.log("submitWithSignature not found");
        }
        
        if (getTx) {
            console.log("getTransaction outputs:");
            getTx.outputs.forEach(output => {
                console.log(`  - ${output.name}: ${output.type}`);
            });
        } else {
            console.log("getTransaction not found");
        }
    } catch (err) {
        console.error(`Error checking ${label}:`, err.message);
    }
}

checkAbi(
    path.join(__dirname, "src/artifacts/BBSNSMultiSig.json"),
    "Backend Src Artifact"
);

checkAbi(
    path.join(__dirname, "../contracts/artifacts/contracts/BBSNSMultiSig.sol/BBSNSMultiSig.json"),
    "Contracts Hardhat Artifact"
);

checkAbi(
    path.join(__dirname, "../contracts/abi/BBSNSMultiSig.json"),
    "Contracts ABI Folder"
);
