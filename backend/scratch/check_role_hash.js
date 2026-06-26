const { ethers } = require('ethers');
const role = ethers.id("RELAYER_ROLE");
console.log(`RELAYER_ROLE hash: ${role}`);
const selector = ethers.id("AccessControlUnauthorizedAccount(address,bytes32)").substring(0, 10);
console.log(`AccessControlUnauthorizedAccount selector: ${selector}`);
