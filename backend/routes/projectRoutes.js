const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  applyToProject,
  getApplicants,
  selectFreelancer,
  respondToDeadline,
  clientRespondToDeadline,
  getDeadline,
  addProgressUpdate,
  getProgressUpdates,
  addRating
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

// ================= DEADLINE NEGOTIATION =================

// Freelancer responds (accept/reject)
router.put("/:id/deadline/respond", protect, authorizeRoles("freelancer"), respondToDeadline);

// Client responds to suggestion
router.put("/:id/deadline/client", protect, authorizeRoles("client"), clientRespondToDeadline);

// Get deadline details
router.get("/:id/deadline", protect, getDeadline);

// ================= PROGRESS TRACKING =================

// Freelancer adds progress
router.post("/:id/progress", protect, authorizeRoles("freelancer"), addProgressUpdate);

// View progress updates
router.get("/:id/progress", protect, getProgressUpdates);

router.put("/:id/rate", protect, authorizeRoles("client"), addRating);

module.exports = router;