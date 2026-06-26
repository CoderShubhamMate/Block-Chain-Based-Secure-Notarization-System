const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'artifacts', 'BBSNSMultiSig.json');
try {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const abi = parsed.abi || parsed;

  // Find the index of the getTransaction function
  const index = abi.findIndex(item => item.name === 'getTransaction');
  if (index !== -1) {
    console.log('Original getTransaction ABI:', JSON.stringify(abi[index], null, 2));

    // Update to Single-Target MultiSig signature
    abi[index] = {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_txIndex",
          "type": "uint256"
        }
      ],
      "name": "getTransaction",
      "outputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "numConfirmations",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "submissionTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "txSignerVersion",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    };

    console.log('Updated getTransaction ABI:', JSON.stringify(abi[index], null, 2));
    
    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(parsed), 'utf8');
    console.log('Successfully updated BBSNSMultiSig.json ABI!');
  } else {
    console.log('getTransaction function not found in ABI!');
  }
} catch (e) {
  console.error('Error:', e.message);
}
