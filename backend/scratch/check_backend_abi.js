const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'artifacts', 'BBSNSMultiSig.json');
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  const abi = parsed.abi || parsed;
  
  const getTxFunc = abi.find(item => item.name === 'getTransaction');
  if (getTxFunc) {
    console.log('Found getTransaction function:');
    console.log(JSON.stringify(getTxFunc, null, 2));
  } else {
    console.log('getTransaction function not found in ABI.');
  }

  const txsMapping = abi.find(item => item.name === 'transactions');
  if (txsMapping) {
    console.log('\nFound transactions mapping/function:');
    console.log(JSON.stringify(txsMapping, null, 2));
  }
} catch (e) {
  console.error('Error:', e.message);
}
