const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const TokenBlacklist = require("../models/TokenBlacklist");

// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: role === "freelancer" ? skills : [],
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Create verification link
    const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;
    // Send email
    await sendEmail(
      email,
      "Verify Your Email",
      `
      <h3>Email Verification</h3>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      `
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
exports.logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await TokenBlacklist.create({ token });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    // 🔥 Redirect to frontend login page
    res.redirect("http://localhost:3000/login");

  } catch (error) {
    res.status(500).send("Server error");
  }
};

// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1️⃣ Check user with email + role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or role",
      });
    }

    // 2️⃣ Check if email verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }

    // 3️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // 4️⃣ Generate JWT (include required fields)
    const token = jwt.sign(
  {
    id: user._id,      // ✅ FIXED
    role: user.role,
    name: user.name,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    // 5️⃣ Send CLEAN response (IMPORTANT for frontend)
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};