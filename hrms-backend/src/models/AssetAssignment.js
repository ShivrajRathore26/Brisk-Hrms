const mongoose = require("mongoose");

const assetAssignmentSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedDate: { type: Date, default: Date.now },
    returnedDate: { type: Date, default: null },
    conditionNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetAssignment", assetAssignmentSchema);
