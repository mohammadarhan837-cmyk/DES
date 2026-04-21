const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // Optional for wallet-only users
    email: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["client", "freelancer"],
      required: true,
    },

    skills: [{ type: String }],

    // 🔐 OTP Verification (6-digit)
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: { type: String },
    otpExpires: { type: Date },

    // 🔑 Password Reset
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },

    // 🦊 MetaMask / Web3 Identity
    walletAddress: {
      type: String,
      sparse: true, // allows multiple nulls
      lowercase: true,
    },
    isWalletLocked: {
      type: Boolean,
      default: false,
    },
    nonce: {
      type: String,  // random challenge string for signature verification
    },
    phoneNumber: {
      type: String,
    },

    // 📊 Scoring
    rating:     { type: Number, default: 0 },
    aiScore:    { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);