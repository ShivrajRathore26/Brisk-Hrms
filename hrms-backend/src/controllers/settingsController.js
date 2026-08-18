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

  const { leavePolicy, workingHours, officeLocation } = req.body;
  if (leavePolicy) settings.leavePolicy = { ...settings.leavePolicy.toObject(), ...leavePolicy };
  if (workingHours) settings.workingHours = { ...settings.workingHours.toObject(), ...workingHours };
  if (officeLocation) settings.officeLocation = { ...settings.officeLocation.toObject(), ...officeLocation };

  await settings.save();
  res.json({ success: true, settings });
});

module.exports = { getSettings, updateSettings };
