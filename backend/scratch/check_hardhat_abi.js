const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'contracts', 'artifacts', 'contracts', 'BBSNSMultiSig.sol', 'BBSNSMultiSig.json');
try {
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist:', filePath);
    return;
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  const abi = parsed.abi;
  
  const getTxFunc = abi.find(item => item.name === 'getTransaction');
  if (getTxFunc) {
    console.log('Found getTransaction function in Hardhat Artifacts:');
    console.log(JSON.stringify(getTxFunc, null, 2));
  } else {
    console.log('getTransaction function not found in Hardhat ABI.');
  }
} catch (e) {
  console.error('Error:', e.message);
}
