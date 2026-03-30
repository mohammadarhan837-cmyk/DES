const Project = require("../models/Project");


// ================= CREATE PROJECT (CLIENT ONLY) =================
exports.createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, budget, proposedDeadline } =
      req.body;

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      requiredSkills,
      budget,
      proposedDeadline,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};


// ================= GET SINGLE PROJECT =================
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("applicants.freelancer", "name email skills");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= FREELANCER APPLY TO PROJECT =================
exports.applyToProject = async (req, res) => {
  try {
    const { proposal } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent duplicate applications
    const alreadyApplied = project.applicants.find(
      (app) => app.freelancer.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        message: "You already applied to this project",
      });
    }

    project.applicants.push({
      freelancer: req.user._id,
      proposal,
    });

    await project.save();

    res.json({
      message: "Application submitted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= CLIENT VIEW APPLICANTS =================
exports.getApplicants = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("applicants.freelancer", "name email skills");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only project owner (client) can view applicants
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to view applicants",
      });
    }

    res.json(project.applicants);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= CLIENT SELECT FREELANCER =================
exports.selectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only project owner can select freelancer
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to select freelancer",
      });
    }

    // Check if freelancer applied
    const applied = project.applicants.find(
      (app) => app.freelancer.toString() === freelancerId
    );

    if (!applied) {
      return res.status(400).json({
        message: "Freelancer did not apply to this project",
      });
    }

    project.freelancer = freelancerId;
    project.status = "in-progress";

    await project.save();

    res.json({
      message: "Freelancer selected successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FREELANCER RESPOND TO DEADLINE =================
exports.respondToDeadline = async (req, res) => {
  try {
    const { action, newDeadline } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only assigned freelancer can respond
    if (project.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to respond to deadline",
      });
    }

    if (action === "accept") {
      project.finalDeadline = project.proposedDeadline;
      project.deadlineStatus = "finalized";
    }

    else if (action === "reject") {
      if (!newDeadline) {
        return res.status(400).json({
          message: "Please provide a new deadline",
        });
      }

      project.suggestedDeadline = newDeadline;
      project.deadlineStatus = "negotiating";
    }

    await project.save();

    res.json({
      message: "Response submitted successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CLIENT RESPOND TO SUGGESTED DEADLINE =================
exports.clientRespondToDeadline = async (req, res) => {
  try {
    const { action } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client can respond
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (action === "accept") {
      project.finalDeadline = project.suggestedDeadline;
      project.deadlineStatus = "finalized";
    }

    await project.save();

    res.json({
      message: "Client response saved",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= GET DEADLINE DETAILS =================
exports.getDeadline = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      proposedDeadline: project.proposedDeadline,
      suggestedDeadline: project.suggestedDeadline,
      finalDeadline: project.finalDeadline,
      deadlineStatus: project.deadlineStatus,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= ADD PROGRESS UPDATE =================
exports.addProgressUpdate = async (req, res) => {
  try {
    const { text } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only assigned freelancer can update progress
    if (project.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update progress",
      });
    }

    project.progressUpdates.push({ text });

    // Update last update time
    project.lastUpdate = new Date();

    await project.save();

    res.json({
      message: "Progress updated successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= GET PROGRESS UPDATES =================
exports.getProgressUpdates = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.progressUpdates);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
