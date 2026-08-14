const catchAsync = require("../utils/catchAsync");
const CompanySettings = require("../models/CompanySettings");

const getSettings = catchAsync(async (req, res) => {
  let settings = await CompanySettings.findOne();
  if (!settings) settings = await CompanySettings.create({});
  res.json({ success: true, settings });
});

const updateSettings = catchAsync(async (req, res) => {
  let settings = await CompanySettings.findOne();
  if (!settings) settings = new CompanySettings();

  const { leavePolicy, taxRules, workingHours } = req.body;
  if (leavePolicy) settings.leavePolicy = { ...settings.leavePolicy.toObject(), ...leavePolicy };
  if (taxRules) settings.taxRules = { ...settings.taxRules.toObject(), ...taxRules };
  if (workingHours) settings.workingHours = { ...settings.workingHours.toObject(), ...workingHours };

  await settings.save();
  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
