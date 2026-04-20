// checkWallet.js
const { ethers } = require("ethers");
require("dotenv").config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

console.log("Backend Wallet Address:", wallet.address);