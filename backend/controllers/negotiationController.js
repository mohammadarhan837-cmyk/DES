const Negotiation = require("../models/Negotiation");
const Project     = require("../models/Project");
const User        = require("../models/User");
const blockchain  = require("../services/blockchainService");

// ── helper ──
const isClient     = (project, userId) => project.client.toString()     === userId.toString();
const isFreelancer = (project, userId) => project.freelancer && project.freelancer.toString() === userId.toString();

// ================= GET NEGOTIATION =================
exports.getNegotiation = async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({ projectId: req.params.projectId })
      .populate("proposedBy", "name role");

    if (!negotiation) {
      return res.status(404).json({ message: "No negotiation found for this project" });
    }

    res.json(negotiation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE NEGOTIATION (internal — called from projectController) =================
exports.createNegotiation = async (projectId, originalBudget, originalDeadline, clientId) => {
  return Negotiation.create({
    projectId,
    originalBudget,
    originalDeadline,
    proposedBudget:   originalBudget,
    proposedDeadline: originalDeadline,
    proposedBy:       clientId,
    history: [{
      round:      1,
      budget:     originalBudget,
      deadline:   originalDeadline,
      proposedBy: clientId,
      action:     "InitialOffer",
    }],
  });
};

// ================= FREELANCER ACCEPTS TERMS =================
exports.freelancerAccept = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project     = await Project.findById(projectId);
    const negotiation = await Negotiation.findOne({ projectId });

    if (!project || !negotiation) {
      return res.status(404).json({ message: "Project or negotiation not found" });
    }

    if (!isFreelancer(project, req.user._id)) {
      return res.status(403).json({ message: "Only the assigned freelancer can accept" });
    }

    if (!["PendingNegotiation", "CounterOffered"].includes(negotiation.status)) {
      return res.status(400).json({ message: `Cannot accept in status: ${negotiation.status}` });
    }

    // Lock in agreed terms
    negotiation.agreedBudget   = negotiation.proposedBudget;
    negotiation.agreedDeadline = negotiation.proposedDeadline;
    negotiation.status         = "Agreed";
    negotiation.history.push({
      round:      negotiation.round,
      budget:     negotiation.proposedBudget,
      deadline:   negotiation.proposedDeadline,
      proposedBy: req.user._id,
      action:     "Accepted",
    });
    await negotiation.save();

    // Mirror on project
    project.negotiationStatus = "Agreed";
    await project.save();

    res.json({ message: "Terms accepted! Client can now lock funds.", negotiation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= FREELANCER COUNTER-OFFER =================
exports.freelancerCounter = async (req, res) => {
  try {
    const { projectId, counterBudget, counterDeadline } = req.body;

    const project     = await Project.findById(projectId);
    const negotiation = await Negotiation.findOne({ projectId });

    if (!project || !negotiation) {
      return res.status(404).json({ message: "Project or negotiation not found" });
    }

    if (!isFreelancer(project, req.user._id)) {
      return res.status(403).json({ message: "Only the assigned freelancer can counter" });
    }

    negotiation.proposedBudget   = counterBudget;
    negotiation.proposedDeadline = new Date(counterDeadline);
    negotiation.proposedBy       = req.user._id;
    negotiation.status           = "CounterOffered";
    negotiation.round            += 1;
    negotiation.history.push({
      round:      negotiation.round,
      budget:     counterBudget,
      deadline:   new Date(counterDeadline),
      proposedBy: req.user._id,
      action:     "Counter",
    });
    await negotiation.save();

    project.negotiationStatus = "CounterOffered";
    await project.save();

    res.json({ message: "Counter-offer sent to client.", negotiation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CLIENT ACCEPTS COUNTER =================
exports.clientAcceptCounter = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project     = await Project.findById(projectId);
    const negotiation = await Negotiation.findOne({ projectId });

    if (!project || !negotiation) {
      return res.status(404).json({ message: "Project or negotiation not found" });
    }

    if (!isClient(project, req.user._id)) {
      return res.status(403).json({ message: "Only the project client can accept" });
    }

    if (negotiation.status !== "CounterOffered") {
      return res.status(400).json({ message: "No counter-offer to accept" });
    }

    negotiation.agreedBudget   = negotiation.proposedBudget;
    negotiation.agreedDeadline = negotiation.proposedDeadline;
    negotiation.status         = "Agreed";
    negotiation.history.push({
      round:      negotiation.round,
      budget:     negotiation.proposedBudget,
      deadline:   negotiation.proposedDeadline,
      proposedBy: req.user._id,
      action:     "Accepted",
    });
    await negotiation.save();

    project.negotiationStatus = "Agreed";
    await project.save();

    res.json({ message: "Counter accepted! You can now lock funds.", negotiation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CLIENT RE-COUNTER =================
exports.clientReCounter = async (req, res) => {
  try {
    const { projectId, counterBudget, counterDeadline } = req.body;

    const project     = await Project.findById(projectId);
    const negotiation = await Negotiation.findOne({ projectId });

    if (!project || !negotiation) {
      return res.status(404).json({ message: "Project or negotiation not found" });
    }

    if (!isClient(project, req.user._id)) {
      return res.status(403).json({ message: "Only the project client can re-counter" });
    }

    negotiation.proposedBudget   = counterBudget;
    negotiation.proposedDeadline = new Date(counterDeadline);
    negotiation.proposedBy       = req.user._id;
    negotiation.status           = "PendingNegotiation";
    negotiation.round            += 1;
    negotiation.history.push({
      round:      negotiation.round,
      budget:     counterBudget,
      deadline:   new Date(counterDeadline),
      proposedBy: req.user._id,
      action:     "Counter",
    });
    await negotiation.save();

    project.negotiationStatus = "PendingNegotiation";
    await project.save();

    res.json({ message: "Re-counter sent to freelancer.", negotiation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LOCK FUNDS (Old Backend-paid version - still here as backup) =================
exports.lockFunds = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project     = await Project.findById(projectId).populate("freelancer");
    const negotiation = await Negotiation.findOne({ projectId });

    if (!project || !negotiation) {
      return res.status(404).json({ message: "Project or negotiation not found" });
    }

    if (!isClient(project, req.user._id)) {
      return res.status(403).json({ message: "Only the client can lock funds" });
    }

    if (negotiation.status !== "Agreed") {
      return res.status(400).json({ message: "Agreement needed before locking funds" });
    }

    const freelancer = await User.findById(project.freelancer);
    if (!freelancer || !freelancer.walletAddress) {
      return res.status(400).json({ message: "Freelancer must connect wallet first" });
    }

    // Deploy via backend wallet
    const contractAddress = await blockchain.deployEscrow(freelancer.walletAddress, negotiation.agreedBudget);

    project.contractAddress = contractAddress;
    project.fundsLocked = true;
    project.negotiationStatus = "FundsLocked";
    await project.save();

    negotiation.status = "FundsLocked";
    await negotiation.save();

    res.json({ message: "Funds locked!", contractAddress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= REPORT DEPLOYED CONTRACT (Client MetaMask version) =================
exports.reportDeployment = async (req, res) => {
  try {
    const { projectId, contractAddress } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    project.contractAddress = contractAddress;
    project.fundsLocked = true;
    project.negotiationStatus = "FundsLocked";
    project.status = "In Progress";
    await project.save();

    const negotiation = await Negotiation.findOne({ projectId });
    if (negotiation) {
      negotiation.status = "FundsLocked";
      negotiation.history.push({
        round: negotiation.round,
        budget: project.budget,
        deadline: project.deadline,
        proposedBy: req.user._id,
        action: "Locked",
      });
      await negotiation.save();
    }

    res.json({ message: "Deployment recorded successfully!", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
