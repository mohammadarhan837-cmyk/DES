const express = require("express");
const router  = express.Router();
const {
  logProgress,
  getProgress,
  requestExtension,
  respondExtension,
  submitWork,
} = require("../controllers/progressController");
const protect        = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/log",                protect, authorizeRoles("freelancer"), logProgress);
router.get("/:projectId",          protect, getProgress);
router.post("/submit-work",        protect, authorizeRoles("freelancer"), submitWork);
router.post("/request-extension",  protect, authorizeRoles("freelancer"), requestExtension);
router.put("/respond-extension",   protect, authorizeRoles("client"),     respondExtension);

module.exports = router;
