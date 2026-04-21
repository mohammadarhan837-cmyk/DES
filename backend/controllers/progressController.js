const Project = require("../models/Project");
const sendEmail = require("../utils/sendEmail");

// ================= LOG PROGRESS =================
exports.logProgress = async (req, res) => {
  try {
    const { projectId, percent, note } = req.body;
    const project = await Project.findById(projectId).populate("client");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update progress
    project.progressPercent = percent;
    project.progressUpdates.push({ percent, note, updatedAt: new Date() });
    
    // Reset warning levels if progress made
    if (percent > 0) {
      project.warningLevel = "None";
      project.terminationEligible = false;
    }

    await project.save();

    res.json({ message: "Progress logged successfully!", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= SUBMIT WORK =================
exports.submitWork = async (req, res) => {
  try {
    const { projectId, link, note } = req.body;
    const project = await Project.findById(projectId).populate("client");

    if (!project) return res.status(404).json({ message: "Project not found" });

    project.submissionStatus = "Submitted";
    project.submissionData = {
      link,
      note,
      submittedAt: new Date()
    };
    
    await project.save();

    // Notify client
    sendEmail(
      project.client.email,
      "Work Submitted for Review",
      `<h3>Project: ${project.title}</h3>
       <p>The freelancer has submitted their work for your review.</p>
       <p><strong>Note:</strong> ${note || "No note provided"}</p>
       <p>Login to your dashboard to review the submission.</p>`
    ).catch(err => console.warn("Email notify failed:", err.message));

    res.json({ message: "Work submitted successfully!", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= REQUEST EXTENSION =================
exports.requestExtension = async (req, res) => {
  try {
    const { projectId, newDeadline, reason } = req.body;
    const project = await Project.findById(projectId).populate("client");

    if (!project) return res.status(404).json({ message: "Project not found" });

    project.extensionStatus = "Pending";
    project.extensionRequest = {
      newDeadline: new Date(newDeadline),
      reason,
      requestedAt: new Date()
    };

    await project.save();

    res.json({ message: "Extension requested!", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= RESPOND TO EXTENSION =================
exports.respondExtension = async (req, res) => {
  try {
    const { projectId, approved } = req.body;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (approved) {
      project.deadline = project.extensionRequest.newDeadline;
      project.extensionStatus = "Approved";
      // Clear warnings since deadline moved
      project.warningLevel = "None";
      project.terminationEligible = false;
    } else {
      project.extensionStatus = "Denied";
    }

    await project.save();
    res.json({ message: `Extension ${approved ? "approved" : "denied"}`, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET PROGRESS =================
exports.getProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).select("progressPercent progressUpdates warningLevel");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

