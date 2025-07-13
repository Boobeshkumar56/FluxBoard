require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // match your contract pragma
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
};
