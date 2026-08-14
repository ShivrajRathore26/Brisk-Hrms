const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: { type: String, enum: ["sick", "casual", "earned"], required: true },
    total: { type: Number, required: true },
    used: { type: Number, default: 0 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

leaveBalanceSchema.index({ user: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
