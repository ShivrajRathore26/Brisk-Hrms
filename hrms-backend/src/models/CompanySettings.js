const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    leavePolicy: {
      sick: { type: Number, default: 12 },
      casual: { type: Number, default: 12 },
      earned: { type: Number, default: 15 },
    },
    taxRules: {
      // simple flat slab rules, editable by Super Admin; percentage of gross pay
      slabs: {
        type: [{ upTo: Number, rate: Number }],
        default: [
          { upTo: 500000, rate: 0 },
          { upTo: 1000000, rate: 10 },
          { upTo: Infinity, rate: 20 },
        ],
      },
    },
    workingHours: {
      start: { type: String, default: "09:30" },
      end: { type: String, default: "18:30" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
