const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { verifyEmail } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);

module.exports = router;