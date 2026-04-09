const express = require("express");
const router = express.Router();

const {
  createDispute,
  getDisputes,
  resolveDispute,
} = require("../controllers/disputeController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Create dispute
router.post("/", protect, createDispute);

// Get all disputes
router.get("/", protect, getDisputes);

// Resolve dispute (admin/client)
router.put("/resolve", protect, resolveDispute);

module.exports = router;