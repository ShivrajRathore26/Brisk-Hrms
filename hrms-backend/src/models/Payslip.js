const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    grossPay: { type: Number, required: true },
    taxDeducted: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    pdfUrl: { type: String, default: "" },
    generatedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

payslipSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);
