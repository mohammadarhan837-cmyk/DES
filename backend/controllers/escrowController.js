const Escrow = require("../models/Escrow");
const Project = require("../models/Project");

// ================= GET ESCROW =================
exports.getEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ projectId: req.params.projectId });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    res.json(escrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOCK PAYMENT =================
exports.lockPayment = async (req, res) => {
  try {
    const { projectId, amount, clientWallet, freelancerWallet } = req.body;

    // 🔥 Look up the real contract address from the Project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const contractAddress = project.contractAddress || "0xPENDING";

    const escrow = await Escrow.create({
      projectId,
      contractAddress,
      totalLocked: amount,
      clientWallet,
      freelancerWallet,
      transactions: [
        {
          type: "lock",
          amount,
          from: clientWallet,
          to: "escrow",
          status: "Confirmed",
        },
      ],
    });

    res.json({
      message: "Payment locked successfully",
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RELEASE PAYMENT =================
exports.releasePayment = async (req, res) => {
  try {
    const { projectId } = req.body;

    const escrow = await Escrow.findOne({ projectId });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    escrow.released = escrow.totalLocked;
    escrow.status = "Released";

    escrow.transactions.push({
      type: "release",
      amount: escrow.totalLocked,
      from: "escrow",
      to: escrow.freelancerWallet,
      status: "Confirmed",
    });

    await escrow.save();

    res.json({
      message: "Payment released",
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REFUND PAYMENT =================
exports.refundPayment = async (req, res) => {
  try {
    const { projectId } = req.body;

    const escrow = await Escrow.findOne({ projectId });

    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    escrow.status = "Refunded";

    escrow.transactions.push({
      type: "refund",
      amount: escrow.totalLocked,
      from: "escrow",
      to: escrow.clientWallet,
      status: "Confirmed",
    });

    await escrow.save();

    res.json({
      message: "Payment refunded",
      escrow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};