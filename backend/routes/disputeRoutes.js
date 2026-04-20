const express = require("express");
const router = express.Router();

const {
  createDispute,
  getDisputes,
  getMyDisputes,
  resolveDispute,
} = require("../controllers/disputeController");

const protect = require("../middleware/authMiddleware");

// Create dispute
router.post("/", protect, createDispute);

// Get all disputes (admin use)
router.get("/", protect, getDisputes);

// Get disputes scoped to current user's projects
router.get("/my", protect, getMyDisputes);

// Resolve dispute (client only – enforced in controller)
router.put("/resolve", protect, resolveDispute);

module.exports = router;