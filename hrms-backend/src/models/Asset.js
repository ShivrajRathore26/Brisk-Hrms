const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    // Free-form so HR can introduce new device types beyond the common presets suggested in the UI.
    assetType: { type: String, required: true, trim: true, lowercase: true },
    modelName: { type: String, default: "" },
    serialNumber: { type: String, unique: true, sparse: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "assigned", "under_repair", "damaged", "retired"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
