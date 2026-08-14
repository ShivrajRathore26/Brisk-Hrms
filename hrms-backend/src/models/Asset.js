const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetType: {
      type: String,
      enum: ["laptop", "monitor", "mouse", "keyboard", "other"],
      required: true,
    },
    modelName: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["available", "assigned", "under_repair", "damaged", "retired"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
