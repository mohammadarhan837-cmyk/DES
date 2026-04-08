const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  applyToProject,
  getApplicants,
  selectFreelancer,
  addMilestone,
  updateMilestone,
  addRating,
  matchFreelancers
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ================= CREATE PROJECT =================
router.post("/", protect, authorizeRoles("client"), createProject);

// ================= VIEW PROJECTS =================
router.get("/", protect, getAllProjects);
router.get("/:id", protect, getProjectById);

// ================= UPDATE PROJECT =================
router.put("/:id", protect, authorizeRoles("client"), updateProject);

// ================= FREELANCER APPLY =================
router.post("/:id/apply", protect, authorizeRoles("freelancer"), applyToProject);

// ================= CLIENT VIEW APPLICANTS =================
router.get("/:id/applicants", protect, authorizeRoles("client"), getApplicants);

// ================= CLIENT SELECT FREELANCER =================
router.put("/:id/select", protect, authorizeRoles("client"), selectFreelancer);

// ================= MILESTONES =================
router.post("/:id/milestone", protect, authorizeRoles("client"), addMilestone);
router.put("/:id/milestone", protect, updateMilestone);

// ================= RATING =================
router.post("/:id/rating", protect, authorizeRoles("client"), addRating);

// ================= SKILL MATCH =================
router.get("/:id/match", protect, matchFreelancers);

module.exports = router;