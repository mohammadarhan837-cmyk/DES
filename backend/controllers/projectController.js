const Project = require("../models/Project");
const blockchain = require("../services/blockchainService");

// ================= CREATE PROJECT =================
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      skills,
      requirements,
    } = req.body;

    // ⚠️ For now we use a fixed freelancer wallet
    // Later this can come from freelancer profile
    const freelancerWallet =
      "0x13A971266830990fF088E92D418e2c623cF16d42";

    // 🔥 STEP 1: Deploy contract
    const safeBudget = parseFloat(budget);
    const contractAddress = await blockchain.deployEscrow(
      freelancerWallet,
      safeBudget
    );

    // 🔥 STEP 2: Create project
    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      budget,
      deadline,
      skills,
      requirements,
      contractAddress, // ✅ important
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("❌ Create Project Error:", error.message);
    res.status(500).json({ message: "Project creation failed" });
  }
};

// ================= GET ALL PROJECTS =================
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name email")
      .populate("freelancer", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// ================= GET PROJECT BY ID =================
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project" });
  }
};

// ================= UPDATE PROJECT =================
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client can update
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(project, req.body);

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= APPLY TO PROJECT =================
exports.applyToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    project.applicants.push({
      freelancer: req.user._id,
      proposal: req.body.proposal,
    });

    await project.save();

    res.json({ message: "Applied successfully" });
  } catch (error) {
    res.status(500).json({ message: "Apply failed" });
  }
};

// ================= GET APPLICANTS =================
exports.getApplicants = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("applicants.freelancer", "name email");

    res.json(project.applicants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

// ================= SELECT FREELANCER =================
exports.selectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;

    const project = await Project.findById(req.params.id);

    project.freelancer = freelancerId;
    project.status = "In Progress";

    await project.save();

    res.json({ message: "Freelancer selected" });
  } catch (error) {
    res.status(500).json({ message: "Selection failed" });
  }
};

// ================= ADD MILESTONE =================
exports.addMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    project.milestones.push(req.body);

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to add milestone" });
  }
};

// ================= UPDATE MILESTONE =================
exports.updateMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const milestone = project.milestones.id(req.body.milestoneId);

    if (milestone) {
      milestone.status = req.body.status;
    }

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to update milestone" });
  }
};

