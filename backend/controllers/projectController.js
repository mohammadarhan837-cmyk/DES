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
    const projects = await Project.find().populate("client", "name email");

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
      .populate("freelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};