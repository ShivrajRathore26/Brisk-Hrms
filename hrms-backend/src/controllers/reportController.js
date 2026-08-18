const catchAsync = require("../utils/catchAsync");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Asset = require("../models/Asset");
const User = require("../models/User");

async function scopedUserIds(req) {
  if (req.user.role === "manager") {
    const team = await User.find({ manager: req.user._id }).select("_id");
    return team.map((u) => u._id);
  }
  return null; // null => no restriction (HR/Super Admin see everyone)
}

const attendanceReport = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const userIds = await scopedUserIds(req);

  const filter = {};
  if (userIds) filter.user = { $in: userIds };
  if (from && to) filter.date = { $gte: new Date(from), $lte: new Date(to) };

  const records = await Attendance.find(filter).populate("user", "name department");
  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  res.json({ success: true, summary, records });
});

const leaveReport = catchAsync(async (req, res) => {
  const { from, to, status } = req.query;
  const userIds = await scopedUserIds(req);

  const filter = {};
  if (userIds) filter.user = { $in: userIds };
  if (status) filter.status = status;
  if (from && to) filter.fromDate = { $gte: new Date(from), $lte: new Date(to) };

  const records = await LeaveRequest.find(filter).populate("user", "name department").sort({ fromDate: -1 });
  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  res.json({ success: true, summary, records });
});

const assetReport = catchAsync(async (req, res) => {
  const assets = await Asset.find();
  const byStatus = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const byType = assets.reduce((acc, a) => {
    acc[a.assetType] = (acc[a.assetType] || 0) + 1;
    return acc;
  }, {});

  res.json({ success: true, byStatus, byType, total: assets.length });
});

module.exports = { attendanceReport, leaveReport, assetReport };
