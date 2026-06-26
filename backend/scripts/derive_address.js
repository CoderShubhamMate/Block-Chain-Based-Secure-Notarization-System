const { ethers } = require('ethers');
const pk = '0xd61ee2917dcb6bd3e6be9ce81788ecff0579913f9913ee6152ae9467fbba67d6';
console.log('Private Key:', pk);
console.log('Derived Address:', new ethers.Wallet(pk).address);
