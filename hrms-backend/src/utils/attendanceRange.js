const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Holiday = require("../models/Holiday");
const User = require("../models/User");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

// Fills the gaps in a user's attendance for [from, to) with synthetic "absent" entries —
// but only for real working days: skips weekends, holidays, days on approved leave, days
// before the user joined, and any day that hasn't happened yet.
async function buildAttendanceRange(userId, from, to) {
  const [user, records, approvedLeaves, holidays] = await Promise.all([
    User.findById(userId).select("joiningDate"),
    Attendance.find({ user: userId, date: { $gte: from, $lt: to } }),
    LeaveRequest.find({ user: userId, status: "approved", fromDate: { $lt: to }, toDate: { $gte: from } }),
    Holiday.find({ date: { $gte: from, $lt: to } }),
  ]);

  const byDate = new Map(records.map((r) => [dateKey(r.date), r]));
  const holidaySet = new Set(holidays.map((h) => dateKey(h.date)));
  const leaveRanges = approvedLeaves.map((l) => [startOfDay(l.fromDate), startOfDay(l.toDate)]);
  const joiningDay = user?.joiningDate ? startOfDay(user.joiningDate) : null;
  const today = startOfDay(new Date());

  const onLeave = (day) => leaveRanges.some(([from_, to_]) => day >= from_ && day <= to_);

  const result = [];
  for (let d = startOfDay(from); d < to && d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    const key = dateKey(day);
    const existing = byDate.get(key);
    if (existing) {
      result.push(existing);
      continue;
    }

    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // weekend
    if (holidaySet.has(key)) continue; // holiday
    if (joiningDay && day < joiningDay) continue; // before they joined
    if (onLeave(day)) continue; // approved leave, not absent

    result.push({ user: userId, date: day, status: "absent", synthetic: true });
  }

  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = { buildAttendanceRange };
