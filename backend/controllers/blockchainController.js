const Project = require("../models/Project");
const blockchain = require("../services/blockchainService");

// ================= RELEASE PAYMENT =================
const releasePayment = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.contractAddress) {
      return res.status(400).json({ error: "No contract linked to project" });
    }

    // ✅ Payment is now released via MetaMask in the frontend.
    // The backend just synchronizes the status now.
    project.status = "Completed";
    await project.save();

    res.json({ success: true, message: "Project status updated to Completed" });

  } catch (err) {
    console.error("❌ Release Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ================= REFUND =================
const refundClient = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const txHash = await blockchain.refundClient(
      project.contractAddress
    );

    project.status = "Disputed";
    await project.save();

    res.json({ success: true, txHash });

  } catch (err) {
    console.error("❌ Refund Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  releasePayment,
  refundClient,
};
