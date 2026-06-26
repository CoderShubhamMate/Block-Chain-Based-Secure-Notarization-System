const { ethers } = require('ethers');

// ABI for inspecting BBSNSMultiSig transactions using getTransaction
const ABI = [
  "function getTransactionCount() view returns (uint256)",
  "function getTransaction(uint256 _txIndex) view returns (address[] memory to, uint256[] memory value, bytes[] memory data, bool executed, uint256 numConfirmations, uint256 submissionTime, uint256 txSignerVersion)",
  "function transactions(uint256 index) view returns (bool executed, uint256 numConfirmations, uint256 submissionTime, uint256 signerVersion, bytes32 proposalHash)"
];

const ABI_INTERFACES = [
  "function addSigner(address signer)",
  "function removeSigner(address signer)",
  "function changeThreshold(uint256 threshold)",
  "function setTimelock(uint256 delay)",
  "function recordAction(bytes32 docHash, uint8 status)",
  "function updateDailyLimit(uint256 limit)",
  "function setRelayer(address relayer)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address newOwner)",
  "function setContractMetadata(string name, string symbol)"
];

const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
const multisigAddress = '0x3a7999c7de3f3A304Cc5F6f0f9a7340DE711c1aA';
const contract = new ethers.Contract(multisigAddress, ABI, provider);
const iface = new ethers.Interface(ABI_INTERFACES);

async function run() {
  try {
    console.log(`\n=== AUDITING MULTISIG CONTRACT ===\n`);
    
    // Check total transaction count
    const txCount = await contract.getTransactionCount();
    console.log('Total Transaction Count on MultiSig Contract:', txCount.toString());

    // Print all transactions
    for (let i = 0; i < Number(txCount); i++) {
      console.log(`\n--- Transaction #${i} ---`);
      
      const txDetails = await contract.getTransaction(i);
      const txStruct = await contract.transactions(i);
      
      console.log('  Executed:', txDetails.executed);
      console.log('  Num Confirmations:', txDetails.numConfirmations.toString());
      console.log('  Submission Time:', new Date(Number(txDetails.submissionTime) * 1000).toISOString());
      console.log('  Proposal Hash:', txStruct.proposalHash);

      for (let j = 0; j < txDetails.to.length; j++) {
        console.log(`  Action #${j}:`);
        console.log('    to:', txDetails.to[j]);
        console.log('    value:', txDetails.value[j].toString());
        console.log('    data length:', txDetails.data[j].length);
        console.log('    data:', txDetails.data[j]);

        if (txDetails.data[j] && txDetails.data[j] !== '0x') {
          try {
            const decoded = iface.parseTransaction({ data: txDetails.data[j] });
            if (decoded) {
              console.log('    ✅ Decoded Method Name:', decoded.name);
              console.log('    ✅ Decoded Args:', decoded.args.map(a => a.toString()));
            } else {
              console.log('    ⚠️ Unknown method encoding.');
            }
          } catch (e) {
            console.log('    ⚠️ Decoding failed:', e.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
