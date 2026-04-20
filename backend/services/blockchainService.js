const { ethers } = require("ethers");
require("dotenv").config();

// ================= PROVIDER =================
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// ================= WALLET =================
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ================= CONTRACT JSON =================
const contractJSON = require("../../blockchain/artifacts/contracts/Escrow.sol/Escrow.json");

// =================================================
// 🚀 DEPLOY NEW ESCROW CONTRACT (PER PROJECT)
// =================================================
const deployEscrow = async (freelancerAddress, amount) => {
  try {
    console.log("🚀 Deploying new escrow contract...");

    const factory = new ethers.ContractFactory(
      contractJSON.abi,
      contractJSON.bytecode,
      wallet
    );

    const contract = await factory.deploy(freelancerAddress, {
      value: ethers.parseEther(amount.toString()),
    });

    await contract.waitForDeployment();

    const address = contract.target;

    console.log("✅ Contract deployed at:", address);

    return address;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
};

// =================================================
// 🔗 GET CONTRACT INSTANCE (DYNAMIC)
// =================================================
const getContract = (address) => {
  return new ethers.Contract(address, contractJSON.abi, wallet);
};

// =================================================
// 💸 RELEASE PAYMENT
// =================================================
const releasePayment = async (contractAddress) => {
  try {
    const contract = getContract(contractAddress);

    console.log("⚡ Checking contract state before release...");

    const isCompleted = await contract.isCompleted();

    if (isCompleted) {
      throw new Error("Payment already released");
    }

    const tx = await contract.releasePayment();
    await tx.wait();

    console.log("✅ Payment released:", tx.hash);

    return tx.hash;
  } catch (error) {
    console.error("❌ Release error:", error.message);
    throw error;
  }
};

// =================================================
// 🔄 REFUND CLIENT
// =================================================
const refundClient = async (contractAddress) => {
  try {
    const contract = getContract(contractAddress);

    const isCompleted = await contract.isCompleted();

    if (isCompleted) {
      throw new Error("Cannot refund after completion");
    }

    const tx = await contract.refundClient();
    await tx.wait();

    console.log("✅ Refund successful:", tx.hash);

    return tx.hash;
  } catch (error) {
    console.error("❌ Refund error:", error.message);
    throw error;
  }
};

// =================================================
// 📦 EXPORTS
// =================================================
module.exports = {
  deployEscrow,
  releasePayment,
  refundClient,
};

