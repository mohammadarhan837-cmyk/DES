const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1d", // auto delete after 1 day
  },
});

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);