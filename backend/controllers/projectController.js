const Project = require("../models/Project");
const { createNegotiation } = require("./negotiationController");
const blockchain = require("../services/blockchainService");

// ================= CREATE PROJECT =================
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills, requirements } = req.body;
    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      budget,
      deadline,
      skills,
      requirements,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Project creation failed" });
  }
};

// ================= GET CLIENT'S OWN PROJECTS =================
exports.getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate("client", "name email")
      .populate("freelancer", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// ================= GET FREELANCER'S PROJECTS =================
exports.getFreelancerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ freelancer: req.user._id })
      .populate("client", "name email")
      .populate("freelancer", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your projects" });
  }
};

// ================= SELECT FREELANCER =================
exports.selectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.freelancer = freelancerId;
    project.status = "In Progress";
    project.negotiationStatus = "PendingNegotiation";
    await project.save();

    // Auto-create Negotiation
    try {
      await createNegotiation(project._id, project.budget, project.deadline, req.user._id);
    } catch (e) {}

    res.json({ message: "Freelancer selected", project });
  } catch (error) {
    res.status(500).json({ message: "Selection failed" });
  }
};

// ================= APPLY TO PROJECT =================
exports.applyToProject = async (req, res) => {
  try {
    const { proposal } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if already applied
    const alreadyApplied = project.applicants.find(a => a.freelancer?.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

    // ✅ FIX: Use 'freelancer' key to match schema
    project.applicants.push({ freelancer: req.user._id, proposal });
    await project.save();

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Apply failed" });
  }
};

// ================= GET APPLICANTS =================
exports.getApplicants = async (req, res) => {
  try {
    // ✅ FIX: Populate 'applicants.freelancer' to match schema
    const project = await Project.findById(req.params.id).populate("applicants.freelancer", "name email role rating");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project.applicants);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};


// ================= ACCEPT WORK (CLIENT) =================
exports.acceptWork = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!project.contractAddress) {
      return res.status(400).json({ 
        message: "No contract linked. Please make sure you have Locked Funds first." 
      });
    }

    // ✅ Payment is now released via MetaMask in the frontend.
    // The backend just synchronizes the status now.
    project.status = "Completed";
    project.submissionStatus = "Accepted";
    await project.save();

    res.json({ message: "Work accepted and status updated!", project });
  } catch (error) {
    // If it's already completed or released, just succeed anyway
    if (error.message.toLowerCase().includes('already')) {
      return res.json({ message: "Sync successful: Payment was already released.", success: true });
    }
    console.error("❌ Accept Work Error:", error.message);
    res.status(500).json({ message: error.message || "Failed to release payment" });
  }
};

// ================= GET ALL PROJECTS (BROWSING) =================
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "Open" }).populate("client", "name");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id)
      .populate("client", "name email phoneNumber")
      .populate("freelancer", "name email walletAddress phoneNumber");
      
    if (!project) return res.status(404).json({ message: "Not found" });

    // ✅ Mutual Contact Sharing Logic
    // Only share phone numbers if funds are locked or negotiation is agreed
    const isSharedState = ["In Progress", "Completed", "Disputed"].includes(project.status) || project.negotiationStatus === "Agreed" || project.negotiationStatus === "FundsLocked";
    
    if (!isSharedState) {
      if (project.client) project.client.phoneNumber = undefined;
      if (project.freelancer) project.freelancer.phoneNumber = undefined;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// ================= DUMMY / HELPER FUNCTIONS TO PREVENT CRASH =================
exports.updateProject = async (req, res) => res.json({ message: "Not implemented" });
exports.submitWork = async (req, res) => res.json({ message: "Use progress routes" });
exports.addMilestone = async (req, res) => res.json({ message: "Not implemented" });
exports.updateMilestone = async (req, res) => res.json({ message: "Not implemented" });
