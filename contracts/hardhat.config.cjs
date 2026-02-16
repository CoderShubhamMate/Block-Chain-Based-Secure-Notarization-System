const path = require("path");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const PRIVATE_KEY = process.env.BNV_SYSTEM_PRIVATE_KEY || process.env.BNB_SYSTEM_PRIVATE_KEY;
const RPC_URL = process.env.BNB_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        bnbTestnet: {
            url: RPC_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
