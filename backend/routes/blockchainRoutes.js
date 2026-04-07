const express = require("express");
const router = express.Router();
const controller = require("../controllers/blockchainController");

router.post("/release-payment", controller.releasePayment);
router.post("/refund", controller.refundClient);

module.exports = router;