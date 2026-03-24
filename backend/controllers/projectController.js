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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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

    // Check if freelancer already applied
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
    res.status(500).json({ message: "Server error" });
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

    res.json(project.applicants);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

    project.freelancer = freelancerId;
    project.status = "in-progress";

    await project.save();

    res.json({
      message: "Freelancer selected successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};