const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    contractAddress: {
      type: String,
      required: true,
    },

    totalLocked: {
      type: Number,
      required: true,
    },

    released: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Released", "Refunded"],
      default: "Active",
    },

    network: {
      type: String,
      default: "Polygon Testnet",
    },

    clientWallet: {
      type: String,
      required: true,
    },

    freelancerWallet: {
      type: String,
      required: true,
    },

    transactions: [
      {
        type: {
          type: String,
        },
        amount: Number,
        from: String,
        to: String,
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["Pending", "Confirmed"],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Escrow", escrowSchema);