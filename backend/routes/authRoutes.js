const express = require("express");
const router  = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getNonce,
  walletLogin,
  linkWallet,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.post("/logout",          protect, logoutUser);
router.post("/verify-otp",      verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// 🦊 MetaMask / Web3 Auth
router.get("/nonce/:address",  getNonce);
router.post("/wallet-login",   walletLogin);
router.post("/link-wallet",    protect, linkWallet);

module.exports = router;