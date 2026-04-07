const blockchain = require("../services/blockchainService");

const releasePayment = async (req, res) => {
  try {
    const txHash = await blockchain.releasePayment();
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refundClient = async (req, res) => {
  try {
    const txHash = await blockchain.refundClient();
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  releasePayment,
  refundClient,
};