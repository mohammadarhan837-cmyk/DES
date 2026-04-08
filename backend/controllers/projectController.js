const Project = require("../models/Project");
const User = require("../models/User");

// ================= CREATE PROJECT =================
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills, requirements } =
      req.body;

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      budget,
      deadline,
      skills,
      requirements,
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
      .populate("client", "_id name")
      .populate("freelancer", "_id name");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE PROJECT =================
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "_id name")
      .populate("freelancer", "_id name");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROJECT =================
exports.updateProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills, requirements } =
      req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only client can update
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.budget = budget || project.budget;
    project.deadline = deadline || project.deadline;
    project.skills = skills || project.skills;
    project.requirements = requirements || project.requirements;

    await project.save();

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= APPLY TO PROJECT =================
exports.applyToProject = async (req, res) => {
  try {
    const { proposal } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

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

    res.json({ message: "Applied successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET APPLICANTS =================
exports.getApplicants = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "applicants.freelancer",
      "_id name skills"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SELECT FREELANCER =================
exports.selectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.freelancer = freelancerId;
    project.status = "In Progress";

    await project.save();

    res.json({
      message: "Freelancer selected successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD MILESTONE =================
exports.addMilestone = async (req, res) => {
  try {
    const { title, due } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.milestones.push({
      title,
      due,
      status: "Pending",
    });

    await project.save();

    res.json({
      message: "Milestone added",
      milestones: project.milestones,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE MILESTONE =================
exports.updateMilestone = async (req, res) => {
  try {
    const { milestoneId, status } = req.body;

    const project = await Project.findById(req.params.id);

    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    milestone.status = status;

    await project.save();

    res.json({
      message: "Milestone updated",
      milestone,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD RATING =================
exports.addRating = async (req, res) => {
  try {
    const { rating } = req.body;

    const project = await Project.findById(req.params.id);

    project.clientRating = rating;
    project.aiScore = Math.floor(Math.random() * 5) + 1;
    project.finalScore = (project.clientRating + project.aiScore) / 2;

    await project.save();

    res.json({
      message: "Rating added successfully",
      rating: project.finalScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SKILL MATCHING =================
exports.matchFreelancers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const freelancers = await User.find({ role: "freelancer" });

    const results = freelancers.map((freelancer) => {
      const matchingSkills = freelancer.skills.filter((skill) =>
        project.skills.includes(skill)
      );

      const matchPercentage =
        (matchingSkills.length / project.skills.length) * 100;

      return {
        freelancerId: freelancer._id,
        name: freelancer.name,
        skills: freelancer.skills,
        matchPercentage,
      };
    });

    results.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};