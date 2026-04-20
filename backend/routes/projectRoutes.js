const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getClientProjects,
  getFreelancerProjects,
  getProjectById,
  updateProject,
  applyToProject,
  getApplicants,
  selectFreelancer,
  submitWork,
  acceptWork,
  addMilestone,
  updateMilestone,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ================= CREATE PROJECT =================
router.post("/", protect, authorizeRoles("client"), createProject);

// ================= VIEW PROJECTS =================
router.get("/", protect, getAllProjects);
router.get("/my-projects", protect, authorizeRoles("client"), getClientProjects);
router.get("/my-work", protect, authorizeRoles("freelancer"), getFreelancerProjects);
router.get("/:id", protect, getProjectById);

// ================= UPDATE PROJECT =================
router.put("/:id", protect, authorizeRoles("client"), updateProject);

// ================= FREELANCER APPLY =================
router.post("/:id/apply", protect, authorizeRoles("freelancer"), applyToProject);

// ================= CLIENT VIEW APPLICANTS =================
router.get("/:id/applicants", protect, authorizeRoles("client"), getApplicants);

// ================= CLIENT SELECT FREELANCER =================
router.put("/:id/select", protect, authorizeRoles("client"), selectFreelancer);

// ================= FREELANCER SUBMIT WORK =================
router.post("/:id/submit", protect, authorizeRoles("freelancer"), submitWork);

// ================= CLIENT ACCEPT WORK (triggers on-chain release) =================
router.post("/:id/accept", protect, authorizeRoles("client"), acceptWork);

// ================= MILESTONES =================
router.post("/:id/milestone", protect, authorizeRoles("client"), addMilestone);
router.put("/:id/milestone", protect, updateMilestone);

module.exports = router;