const mongoose = require("mongoose");

const negotiationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },

    // Original terms from project creation
    originalBudget:   { type: Number, required: true },
    originalDeadline: { type: Date,   required: true },

    // Currently active proposed terms
    proposedBudget:   { type: Number },
    proposedDeadline: { type: Date   },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Final agreed terms (set when status → Agreed)
    agreedBudget:   { type: Number },
    agreedDeadline: { type: Date   },

    status: {
      type: String,
      enum: [
        "PendingNegotiation", // waiting for freelancer to accept/counter
        "CounterOffered",     // freelancer (or client) sent a counter
        "Agreed",             // both sides agreed — client can now Lock Funds
        "FundsLocked",        // client locked funds, contract deployed
      ],
      default: "PendingNegotiation",
    },

    round: { type: Number, default: 1 },

    // Full history of offers for audit trail
    history: [
      {
        round:      Number,
        budget:     Number,
        deadline:   Date,
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: {
          type: String,
          enum: ["InitialOffer", "Counter", "Accepted", "Locked"],
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);
