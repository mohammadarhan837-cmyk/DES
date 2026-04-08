const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // ✅ FRONTEND EXPECTS THIS
    budget: {
      type: Number,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    // ✅ REQUIRED BY FRONTEND
    skills: [
      {
        type: String,
      },
    ],

    requirements: [
      {
        type: String,
      },
    ],

    // ✅ MILESTONES (VERY IMPORTANT)
    milestones: [
      {
        title: String,
        status: {
          type: String,
          default: "Pending",
        },
        due: Date,
      },
    ],

    // ✅ STATUS (MATCH FRONTEND EXACTLY)
    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Disputed"],
      default: "Open",
    },

    // ================= EXISTING FEATURES (KEEP) =================

    applicants: [
      {
        freelancer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        proposal: {
          type: String,
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    progressUpdates: [
      {
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    warningCount: {
      type: Number,
      default: 0,
    },

    lastUpdate: {
      type: Date,
    },

    // ✅ SCORING (MAP TO FRONTEND RATING)
    clientRating: Number,
    aiScore: Number,
    finalScore: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);