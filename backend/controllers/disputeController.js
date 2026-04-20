const Dispute = require("../models/Dispute");
const Project = require("../models/Project");

// ================= CREATE DISPUTE =================
exports.createDispute = async (req, res) => {
  try {
    const { projectId, reason, description } = req.body;

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client or assigned freelancer can raise dispute
    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.freelancer &&
      project.freelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res
        .status(403)
        .json({ message: "You are not a party to this project" });
    }

    const dispute = await Dispute.create({
      projectId,
      raisedBy: req.user._id,
      reason,
      description,
    });

    // Mark project as Disputed
    project.status = "Disputed";
    await project.save();

    res.status(201).json({
      message: "Dispute created",
      dispute,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL DISPUTES =================
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

// ================= GET MY DISPUTES (scoped to user's projects) =================
exports.getMyDisputes = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let projectFilter = {};

    if (role === "client") {
      projectFilter = { client: userId };
    } else if (role === "freelancer") {
      projectFilter = { freelancer: userId };
    }

    const myProjects = await Project.find(projectFilter).select("_id");
    const projectIds = myProjects.map((p) => p._id);

    const disputes = await Dispute.find({ projectId: { $in: projectIds } })
      .populate("projectId", "title")
      .populate("raisedBy", "name email");

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESOLVE DISPUTE (client only) =================
exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId, resolution } = req.body;

    const dispute = await Dispute.findById(disputeId).populate(
      "projectId",
      "client"
    );

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Only the client of that project can resolve
    if (
      dispute.projectId.client.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the project client can resolve this dispute" });
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