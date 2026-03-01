const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Client only can create project
router.post("/", protect, authorizeRoles("client"), createProject);

// Anyone logged in can view projects
router.get("/", protect, getAllProjects);
router.get("/:id", protect, getProjectById);

module.exports = router;