const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    leavePolicy: {
      // Employees accrue this many leave days per calendar month (since joining), uncapped
      // and carried forward indefinitely if unused.
      accrualPerMonth: { type: Number, default: 1 },
    },
    workingHours: {
      start: { type: String, default: "10:00" },
      end: { type: String, default: "18:00" },
      // Punch in between start and start+graceMinutes -> present. After that until lateCutoff -> late.
      // At/after lateCutoff -> half day (arrived too late). Punch out before lunchEnd -> half day
      // (left before/during lunch and never came back).
      graceMinutes: { type: Number, default: 15 },
      lateCutoff: { type: String, default: "11:30" },
      lunchStart: { type: String, default: "14:00" },
      lunchEnd: { type: String, default: "14:45" },
    },
    officeLocation: {
      // Employees must be within radiusMeters of this point to punch in/out.
      latitude: { type: Number, default: 26.911003 },
      longitude: { type: Number, default: 75.729498 },
      radiusMeters: { type: Number, default: 200 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
