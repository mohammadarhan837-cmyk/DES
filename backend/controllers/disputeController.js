const Dispute = require("../models/Dispute");

// ================= CREATE DISPUTE =================
exports.createDispute = async (req, res) => {
  try {
    const { projectId, reason, description } = req.body;

    const dispute = await Dispute.create({
      projectId,
      raisedBy: req.user._id,
      reason,
      description,
    });

    res.status(201).json({
      message: "Dispute created",
      dispute,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET DISPUTES =================
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("projectId", "title")
      .populate("raisedBy", "name email");

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESOLVE DISPUTE =================
exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId, resolution } = req.body;

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = "Resolved";
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;

    await dispute.save();

    res.json({
      message: "Dispute resolved",
      dispute,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};