const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    // FIX 3: added reason field so it is persisted and visible to the co-signer
    reason: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  // FIX 7: timestamps:true adds createdAt and updatedAt automatically
  // Without this, item.createdAt is undefined and screens show "Invalid Date"
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);