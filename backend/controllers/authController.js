const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const TokenBlacklist = require("../models/TokenBlacklist");
const { ethers } = require("ethers");

// In-memory nonce store for NEW wallet users
const nonceStore = new Map();

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: issue JWT
const issueToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name, walletAddress: user.walletAddress },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ================= REGISTER USER (with OTP) =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: Array.isArray(skills) ? skills : [], // Ensure it's an array
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      isVerified: false, 
    });


    // Send OTP Email
    sendEmail(
      email,
      "Your Verification Code - EscrowChain",
      `<h3>Welcome, ${name}!</h3>
       <p>Your 6-digit verification code is:</p>
       <h1 style="color: #00d4ff; letter-spacing: 5px;">${otp}</h1>
       <p>This code expires in 10 minutes.</p>`
    ).catch(err => console.warn("⚠️ OTP Email failed:", err.message));

    res.status(201).json({
      message: "Registration successful! Please check your email for the OTP.",
      email
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = issueToken(user);
    res.json({ message: "Email verified successfully!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD (Request OTP) =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendEmail(
      email,
      "Password Reset Code",
      `<h3>Password Reset Request</h3>
       <p>Your 6-digit code to reset your password is:</p>
       <h1 style="color: #ff6b6b; letter-spacing: 5px;">${otp}</h1>
       <p>If you didn't request this, please ignore this email.</p>`
    ).catch(err => console.warn("⚠️ Reset Email failed:", err.message));

    res.json({ message: "Password reset code sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or role" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in", unverified: true });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = issueToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= WALLET LOGIN (Existing logic) =================
exports.getNonce = async (req, res) => {
  try {
    const walletAddress = req.params.address.toLowerCase();
    const nonce = crypto.randomBytes(16).toString("hex");
    const updateResult = await User.updateMany({ walletAddress }, { nonce });
    const isNewUser = updateResult.matchedCount === 0;

    if (isNewUser) {
      nonceStore.set(walletAddress, { nonce, createdAt: Date.now() });
    }

    res.json({ nonce: `Sign this message to login: ${nonce}`, rawNonce: nonce, isNewUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.walletLogin = async (req, res) => {
  try {
    const { address, signature, role, name } = req.body;
    const walletAddress = address.toLowerCase();
    
    // Support multiple users with the same wallet - filter by role
    let query = { walletAddress };
    if (role) query.role = role;
    
    let user = await User.findOne(query);

    if (user) {
      // ✅ Security: If wallet is locked, verify it matches
      if (user.isWalletLocked && user.walletAddress !== walletAddress) {
        return res.status(403).json({ message: "This account is locked to a different wallet." });
      }

      const expectedMessage = `Sign this message to login: ${user.nonce}`;
      const recovered = ethers.verifyMessage(expectedMessage, signature).toLowerCase();
      if (recovered !== walletAddress) return res.status(401).json({ message: "Invalid signature" });

      // Lock the wallet if not already locked
      if (!user.isWalletLocked) {
        user.walletAddress = walletAddress;
        user.isWalletLocked = true;
      }

      user.nonce = crypto.randomBytes(16).toString("hex");
      await user.save();
    } else {
      if (!role) return res.status(400).json({ message: "Role is required" });
      const stored = nonceStore.get(walletAddress);
      if (!stored || (Date.now() - stored.createdAt > 300000)) return res.status(400).json({ message: "Nonce expired" });
      const expectedMessage = `Sign this message to login: ${stored.nonce}`;
      const recovered = ethers.verifyMessage(expectedMessage, signature).toLowerCase();
      if (recovered !== walletAddress) return res.status(401).json({ message: "Invalid signature" });

      user = await User.create({
        name: name || `User_${walletAddress.slice(2, 8)}`,
        walletAddress,
        isWalletLocked: true, // Auto-lock on creation via wallet
        nonce: crypto.randomBytes(16).toString("hex"),
        role,
        isVerified: true,
      });
      nonceStore.delete(walletAddress);
    }

    const token = issueToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, role: user.role, walletAddress: user.walletAddress } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LINK WALLET TO LOGGED-IN USER =================
exports.linkWallet = async (req, res) => {
  try {
    const { address, signature, nonce } = req.body;
    const walletAddress = address.toLowerCase();
    const userId = req.user._id; // From protect middleware

    // 1. Verify Signature
    const expectedMessage = `Sign this message to login: ${nonce}`;
    const recovered = ethers.verifyMessage(expectedMessage, signature).toLowerCase();
    
    if (recovered !== walletAddress) {
      return res.status(401).json({ message: "Invalid wallet signature" });
    }

    // 2. Check if wallet is already taken by ANOTHER user
    const existingWalletUser = await User.findOne({ walletAddress, _id: { $ne: userId } });
    if (existingWalletUser) {
      return res.status(400).json({ message: "This wallet is already linked to another account." });
    }

    // 3. Update the current user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletAddress = walletAddress;
    user.isWalletLocked = true;
    user.nonce = crypto.randomBytes(16).toString("hex"); // Refresh nonce
    await user.save();

    res.json({
      message: "Wallet linked and locked successfully! ✅",
      walletAddress: user.walletAddress,
      isWalletLocked: user.isWalletLocked
    });
  } catch (error) {
    console.error("Link Wallet Error:", error);
    res.status(500).json({ message: "Server error during wallet linking" });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await TokenBlacklist.create({ token });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};