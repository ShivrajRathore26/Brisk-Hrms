const CompanySettings = require("../models/CompanySettings");

function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

async function getAttendancePolicy() {
  const settings = await CompanySettings.findOne();
  const wh = settings?.workingHours || {};
  return {
    start: wh.start || "10:00",
    end: wh.end || "18:00",
    graceMinutes: wh.graceMinutes ?? 15,
    lateCutoff: wh.lateCutoff || "11:30",
    lunchStart: wh.lunchStart || "14:00",
    lunchEnd: wh.lunchEnd || "14:45",
  };
}

// Present: punched in within the grace period after office start.
// Late: punched in after the grace period but before the late cutoff.
// Half day: punched in at/after the late cutoff (arrived too late).
async function classifyPunchIn(punchInTime) {
  const policy = await getAttendancePolicy();
  const nowMinutes = minutesSinceMidnight(punchInTime);
  const graceEnd = parseTimeToMinutes(policy.start) + policy.graceMinutes;
  const lateCutoff = parseTimeToMinutes(policy.lateCutoff);

  if (nowMinutes <= graceEnd) return "present";
  if (nowMinutes < lateCutoff) return "late";
  return "half_day";
}

// Half day: punched out before lunch is over — left early and never came back.
async function isEarlyDeparture(punchOutTime) {
  const policy = await getAttendancePolicy();
  const nowMinutes = minutesSinceMidnight(punchOutTime);
  return nowMinutes < parseTimeToMinutes(policy.lunchEnd);
}

module.exports = { getAttendancePolicy, classifyPunchIn, isEarlyDeparture };
