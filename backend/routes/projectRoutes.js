const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  applyToProject,
  getApplicants,
  selectFreelancer,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// ================= CREATE PROJECT =================
// Client only can create project
router.post("/", protect, authorizeRoles("client"), createProject);


// ================= VIEW PROJECTS =================
// Anyone logged in can view projects
router.get("/", protect, getAllProjects);
router.get("/:id", protect, getProjectById);


// ================= FREELANCER APPLY =================
// Freelancer applies to a project
router.post("/:id/apply", protect, authorizeRoles("freelancer"), applyToProject);


// ================= CLIENT VIEW APPLICANTS =================
// Client can see freelancers who applied
router.get("/:id/applicants", protect, authorizeRoles("client"), getApplicants);


// ================= CLIENT SELECT FREELANCER =================
// Client selects freelancer for project
router.put("/:id/select", protect, authorizeRoles("client"), selectFreelancer);


module.exports = router;