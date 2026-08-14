const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const SalaryStructure = require("../models/SalaryStructure");
const Payslip = require("../models/Payslip");
const CompanySettings = require("../models/CompanySettings");
const generatePayslipPdf = require("../utils/generatePayslipPdf");
const uploadBuffer = require("../utils/uploadBuffer");
const notify = require("../utils/notify");

function calcAnnualTax(annualGross, slabs) {
  const sorted = [...slabs].sort((a, b) => a.upTo - b.upTo);
  let tax = 0;
  let previousCap = 0;
  for (const slab of sorted) {
    const cap = Number.isFinite(slab.upTo) ? slab.upTo : annualGross;
    const taxable = Math.max(0, Math.min(annualGross, cap) - previousCap);
    tax += (taxable * slab.rate) / 100;
    previousCap = cap;
    if (annualGross <= cap) break;
  }
  return tax;
}

const getSalaryStructure = catchAsync(async (req, res) => {
  const structure = await SalaryStructure.findOne({ user: req.params.userId }).sort({ effectiveFrom: -1 });
  res.json({ success: true, structure: structure || null });
});

const upsertSalaryStructure = catchAsync(async (req, res) => {
  const { basic, hra, allowances, deductions, effectiveFrom } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, "User not found");

  const structure = await SalaryStructure.create({
    user: user._id,
    basic,
    hra: hra || 0,
    allowances: allowances || 0,
    deductions: deductions || 0,
    effectiveFrom: effectiveFrom || new Date(),
  });

  res.status(201).json({ success: true, structure });
});

const runPayroll = catchAsync(async (req, res) => {
  const { month, year, userIds } = req.body;
  if (!month || !year) throw new ApiError(400, "Month and year are required");

  const settings = (await CompanySettings.findOne()) || { taxRules: { slabs: [] } };

  const userFilter = { status: "active" };
  if (userIds?.length) userFilter._id = { $in: userIds };
  const users = await User.find(userFilter);

  const results = [];
  for (const user of users) {
    const structure = await SalaryStructure.findOne({ user: user._id }).sort({ effectiveFrom: -1 });
    if (!structure) continue;

    const existing = await Payslip.findOne({ user: user._id, month, year });
    if (existing) {
      results.push({ user: user.name, status: "skipped", reason: "already generated" });
      continue;
    }

    const grossPay = structure.basic + structure.hra + structure.allowances;
    const annualGross = grossPay * 12;
    const annualTax = calcAnnualTax(annualGross, settings.taxRules.slabs);
    const taxDeducted = Math.round(annualTax / 12);
    const netPay = grossPay - structure.deductions - taxDeducted;

    const payslip = await Payslip.create({
      user: user._id,
      month,
      year,
      basic: structure.basic,
      hra: structure.hra,
      allowances: structure.allowances,
      deductions: structure.deductions,
      grossPay,
      taxDeducted,
      netPay,
    });

    try {
      const buffer = await generatePayslipPdf({ user, payslip });
      const uploadResult = await uploadBuffer(buffer, {
        folder: "hrms/payslips",
        publicId: `${user._id}_${month}_${year}`,
      });
      payslip.pdfUrl = uploadResult.secure_url;
      await payslip.save();
    } catch (err) {
      console.error("Payslip PDF upload failed:", err.message);
    }

    await notify({
      userId: user._id,
      message: `Your payslip for ${month}/${year} is ready`,
      link: "/payslips",
      email: user.email,
      emailSubject: "Your payslip is ready",
    });

    results.push({ user: user.name, status: "generated", netPay });
  }

  res.json({ success: true, results });
});

const getMyPayslips = catchAsync(async (req, res) => {
  const payslips = await Payslip.find({ user: req.user._id }).sort({ year: -1, month: -1 });
  res.json({ success: true, payslips });
});

const getAllPayslips = catchAsync(async (req, res) => {
  const { month, year, userId } = req.query;
  const filter = {};
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  if (userId) filter.user = userId;

  const payslips = await Payslip.find(filter).populate("user", "name email").sort({ year: -1, month: -1 });
  res.json({ success: true, payslips });
});

module.exports = {
  getSalaryStructure,
  upsertSalaryStructure,
  runPayroll,
  getMyPayslips,
  getAllPayslips,
};
