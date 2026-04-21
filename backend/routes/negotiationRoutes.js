const express = require("express");
const router  = express.Router();
const {
  getNegotiation,
  freelancerAccept,
  freelancerCounter,
  clientAcceptCounter,
  clientReCounter,
  lockFunds,
} = require("../controllers/negotiationController");
const protect        = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/:projectId",         protect, getNegotiation);
router.post("/accept",            protect, authorizeRoles("freelancer"), freelancerAccept);
router.post("/counter",           protect, authorizeRoles("freelancer"), freelancerCounter);
router.post("/client-accept",     protect, authorizeRoles("client"),     clientAcceptCounter);
router.post("/client-counter",    protect, authorizeRoles("client"),     clientReCounter);
router.post("/lock-funds",        protect, authorizeRoles("client"),     lockFunds);
router.post("/report-deployment", protect, authorizeRoles("client"),     require("../controllers/negotiationController").reportDeployment);


module.exports = router;
