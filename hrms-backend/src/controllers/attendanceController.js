const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Holiday = require("../models/Holiday");
const LeaveRequest = require("../models/LeaveRequest");
const CompanySettings = require("../models/CompanySettings");
const { distanceInMeters } = require("../utils/geo");
const { classifyPunchIn, isEarlyDeparture } = require("../utils/attendancePolicy");
const { buildAttendanceRange } = require("../utils/attendanceRange");

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function assertWithinOfficeRadius(latitude, longitude) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new ApiError(400, "Location access is required to punch in/out");
  }
  const settings = await CompanySettings.findOne();
  const office = settings?.officeLocation;
  if (!office) return;

  const distance = distanceInMeters(latitude, longitude, office.latitude, office.longitude);
  if (distance > office.radiusMeters) {
    throw new ApiError(
      400,
      `You must be within ${office.radiusMeters}m of the office to punch in/out — you're ~${Math.round(distance)}m away`
    );
  }
}

const punchIn = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;
  await assertWithinOfficeRadius(latitude, longitude);

  const today = startOfDay();
  let record = await Attendance.findOne({ user: req.user._id, date: today });
  if (record && record.punchIn) throw new ApiError(400, "Already punched in today");

  const now = new Date();
  const status = await classifyPunchIn(now);

  if (record) {
    record.punchIn = now;
    record.punchInLocation = { latitude, longitude };
    record.status = status;
    await record.save();
  } else {
    record = await Attendance.create({
      user: req.user._id,
      date: today,
      punchIn: now,
      punchInLocation: { latitude, longitude },
      status,
    });
  }
  res.json({ success: true, attendance: record });
});

const punchOut = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;
  await assertWithinOfficeRadius(latitude, longitude);

  const today = startOfDay();
  const record = await Attendance.findOne({ user: req.user._id, date: today });
  if (!record || !record.punchIn) throw new ApiError(400, "You haven't punched in today");
  if (record.punchOut) throw new ApiError(400, "Already punched out today");

  const now = new Date();
  record.punchOut = now;
  record.punchOutLocation = { latitude, longitude };

  // Left before lunch was over (whether before it started or partway through) — half day,
  // regardless of how on-time the arrival was.
  if (await isEarlyDeparture(now)) {
    record.status = "half_day";
  }

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
  if (month && year) {
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 1);
    const records = await buildAttendanceRange(req.user._id, from, to);
    return res.json({ success: true, records });
  }
  const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
  res.json({ success: true, records });
});

const getUserSummary = catchAsync(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const records = await buildAttendanceRange(req.params.userId, from, to);

  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  res.json({ success: true, summary, records, month, year });
});

const getTeamAttendance = catchAsync(async (req, res) => {
  const { date } = req.query;
  const targetDate = startOfDay(date ? new Date(date) : new Date());
  const dow = targetDate.getDay();

  let userFilter = {};
  if (req.user.role === "manager") {
    userFilter = { manager: req.user._id };
  }
  const teamUsers = await User.find(userFilter).select("_id name designation joiningDate");
  const userIds = teamUsers.map((u) => u._id);

  const [records, holiday, approvedLeaves] = await Promise.all([
    Attendance.find({ user: { $in: userIds }, date: targetDate }),
    Holiday.findOne({ date: targetDate }),
    LeaveRequest.find({
      user: { $in: userIds },
      status: "approved",
      fromDate: { $lte: targetDate },
      toDate: { $gte: targetDate },
    }),
  ]);

  const byUser = Object.fromEntries(records.map((r) => [r.user.toString(), r]));
  const leaveUserIds = new Set(approvedLeaves.map((l) => l.user.toString()));
  const isNonWorkingDay = dow === 0 || dow === 6 || !!holiday;

  const result = teamUsers.map((u) => {
    const existing = byUser[u._id.toString()];
    let attendance = existing || null;
    let dayNote = null;

    if (!existing) {
      if (isNonWorkingDay) dayNote = holiday ? "holiday" : "weekend";
      else if (leaveUserIds.has(u._id.toString())) dayNote = "on_leave";
      else if (u.joiningDate && startOfDay(u.joiningDate) > targetDate) dayNote = "not_joined";
    }

    return {
      user: { _id: u._id, name: u.name, designation: u.designation },
      attendance,
      dayNote, // null means a genuine absence (no record, no leave, a working day)
    };
  });

  res.json({ success: true, date: targetDate, team: result });
});

module.exports = { punchIn, punchOut, getTodayStatus, getMyHistory, getUserSummary, getTeamAttendance };
