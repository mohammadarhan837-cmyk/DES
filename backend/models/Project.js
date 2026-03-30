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

    requiredSkills: [
      {
        type: String,
      },
    ],

    budget: {
      type: Number,
      required: true,
    },

    proposedDeadline: {
      type: Date,
      required: true,
    },

    suggestedDeadline: {
      type: Date,
    },

    finalDeadline: {
      type: Date,
    },

    deadlineStatus: {
      type: String,
      enum: ["pending", "negotiating", "finalized"],
      default: "pending",
    },

    // ================= FREELANCER APPLICATION =================
    applicants: [
      {
        freelancer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        proposal: {
          type: String,
          required: true,
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ================= PROGRESS TRACKING =================
    progressUpdates: [
      {
        text: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ================= HYBRID SCORING SYSTEM (NEW) =================
    clientRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    aiScore: {
      type: Number,
    },

    finalScore: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "terminated"],
      default: "open",
    },

    warningCount: {
      type: Number,
      default: 0,
    },

    lastUpdate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);