const { ethers } = require('ethers');
const selector = ethers.id("ERC20InsufficientBalance(address,uint256,uint256)").substring(0, 10);
console.log(`Selector: ${selector}`);
