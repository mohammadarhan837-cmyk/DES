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

    title:       { type: String, required: true },
    description: { type: String, required: true },
    budget:      { type: Number, required: true },
    deadline:    { type: Date,   required: true },
    skills:      [{ type: String }],
    requirements:[{ type: String }],

    milestones: [
      {
        title:  String,
        status: { type: String, default: "Pending" },
        due:    Date,
      },
    ],

    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Disputed"],
      default: "Open",
    },

    applicants: [
      {
        freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        proposal:   { type: String },
        appliedAt:  { type: Date, default: Date.now },
      },
    ],

    progressUpdates: [
      {
        text:      String,
        percent:   { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Smart Contract (deployed at Lock Funds, NOT at project creation)
    contractAddress: { type: String },

    // ✅ Negotiation Integration
    fundsLocked: { type: Boolean, default: false },
    negotiationStatus: {
      type: String,
      enum: ["None", "PendingNegotiation", "CounterOffered", "Agreed", "FundsLocked"],
      default: "None",
    },

    // ✅ Progress & Milestone Pressure System
    progressPercent:     { type: Number, default: 0, min: 0, max: 100 },
    warningLevel:        { type: String, enum: ["None", "Yellow", "Red"], default: "None" },
    strictWarningAt:     { type: Date   }, // when Red warning was issued
    terminationEligible: { type: Boolean, default: false },

    // ✅ Extension Request
    extensionRequested:       { type: Boolean, default: false },
    extensionProposedDeadline:{ type: Date },
    extensionStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Denied"],
      default: "None",
    },

    // 📝 Progress & Submissions
    progressPercent: { type: Number, default: 0 },
    progressUpdates: [{
      percent:   Number,
      note:      String,
      updatedAt: { type: Date, default: Date.now }
    }],
    submissionStatus: {
      type: String,
      enum: ["None", "Submitted", "Accepted", "Rejected"],
      default: "None"
    },
    submissionData: {
      link: String,
      note: String,
      submittedAt: Date
    },

    warningCount: { type: Number, default: 0 },
    lastUpdate:   { type: Date },

    // Scoring
    clientRating: Number,
    aiScore:      Number,
    finalScore:   Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);