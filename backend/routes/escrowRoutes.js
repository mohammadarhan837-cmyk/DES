const express = require("express");
const router = express.Router();

const {
  getEscrow,
  lockPayment,
  releasePayment,
  refundPayment,
} = require("../controllers/escrowController");

const protect = require("../middleware/authMiddleware");

router.get("/:projectId", protect, getEscrow);
router.post("/lock", protect, lockPayment);
router.post("/release", protect, releasePayment);
router.post("/refund", protect, refundPayment);

module.exports = router;