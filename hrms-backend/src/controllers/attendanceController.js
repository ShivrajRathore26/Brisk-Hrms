const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const punchIn = catchAsync(async (req, res) => {
  const today = startOfDay();
  let record = await Attendance.findOne({ user: req.user._id, date: today });
  if (record && record.punchIn) throw new ApiError(400, "Already punched in today");

  const now = new Date();
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 45);

  if (record) {
    record.punchIn = now;
    record.status = isLate ? "late" : "present";
    await record.save();
  } else {
    record = await Attendance.create({
      user: req.user._id,
      date: today,
      punchIn: now,
      status: isLate ? "late" : "present",
    });
  }
  res.json({ success: true, attendance: record });
});

const punchOut = catchAsync(async (req, res) => {
  const today = startOfDay();
  const record = await Attendance.findOne({ user: req.user._id, date: today });
  if (!record || !record.punchIn) throw new ApiError(400, "You haven't punched in today");
  if (record.punchOut) throw new ApiError(400, "Already punched out today");

  record.punchOut = new Date();
  const hoursWorked = (record.punchOut - record.punchIn) / (1000 * 60 * 60);
  if (hoursWorked < 4) record.status = "half_day";
  await record.save();

  res.json({ success: true, attendance: record });
});

const getTodayStatus = catchAsync(async (req, res) => {
  const today = startOfDay();
  const record = await Attendance.findOne({ user: req.user._id, date: today });
  res.json({ success: true, attendance: record || null });
});

const getMyHistory = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const filter = { user: req.user._id };
  if (month && year) {
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: from, $lt: to };
  }
  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json({ success: true, records });
});

const getTeamAttendance = catchAsync(async (req, res) => {
  const { date } = req.query;
  const targetDate = startOfDay(date ? new Date(date) : new Date());

  let userFilter = {};
  if (req.user.role === "manager") {
    userFilter = { manager: req.user._id };
  }
  const teamUsers = await User.find(userFilter).select("_id name designation");
  const userIds = teamUsers.map((u) => u._id);

  const records = await Attendance.find({ user: { $in: userIds }, date: targetDate });
  const byUser = Object.fromEntries(records.map((r) => [r.user.toString(), r]));

  const result = teamUsers.map((u) => ({
    user: { _id: u._id, name: u.name, designation: u.designation },
    attendance: byUser[u._id.toString()] || null,
  }));

  res.json({ success: true, date: targetDate, team: result });
});

module.exports = { punchIn, punchOut, getTodayStatus, getMyHistory, getTeamAttendance };
