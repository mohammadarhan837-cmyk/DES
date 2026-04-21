const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const Project = require("../models/Project");
const Escrow = require("../models/Escrow");
const Negotiation = require("../models/Negotiation");
const Dispute = require("../models/Dispute");

const resetDB = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing collections...");

    await Promise.all([
      User.deleteMany({}),
      TokenBlacklist.deleteMany({}),
      Project.deleteMany({}),
      Escrow.deleteMany({}),
      Negotiation.deleteMany({}),
      Dispute.deleteMany({}),
    ]);

    // Drop indexes to ensure uniqueness constraints are removed from DB
    try {
      await User.collection.dropIndexes();
      console.log("Indexes dropped for User collection.");
    } catch (e) {
      console.log("No indexes to drop for User collection or already dropped.");
    }

    console.log("✅ All collections cleared successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
};

resetDB();
