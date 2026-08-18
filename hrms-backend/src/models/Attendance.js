const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    punchIn: { type: Date },
    punchInLocation: { latitude: Number, longitude: Number },
    punchOut: { type: Date },
    punchOutLocation: { latitude: Number, longitude: Number },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave", "late"],
      default: "present",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
