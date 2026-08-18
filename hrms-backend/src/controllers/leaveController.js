const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const CompanySettings = require("../models/CompanySettings");
const { computeAccrued } = require("../utils/leaveAccrual");
const notify = require("../utils/notify");

function daysBetween(from, to) {
  const ms = new Date(to) - new Date(from);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getAccrualRate() {
  const settings = await CompanySettings.findOne();
  return settings?.leavePolicy?.accrualPerMonth ?? 1;
}

async function getUsedDays(userId) {
  const approved = await LeaveRequest.find({ user: userId, status: "approved" });
  // Only paid days count against the balance — unpaid days (beyond the balance at approval
  // time) don't consume it, so "available" never goes negative.
  return approved.reduce((sum, l) => sum + (daysBetween(l.fromDate, l.toDate) - (l.unpaidDays || 0)), 0);
}

async function getBalanceFor(user) {
  const accrualPerMonth = await getAccrualRate();
  const accrued = computeAccrued(user.joiningDate, accrualPerMonth);
  const used = await getUsedDays(user._id);
  return { accrued, used, available: accrued - used };
}

const getMyBalance = catchAsync(async (req, res) => {
  const balance = await getBalanceFor(req.user);
  res.json({ success: true, balance });
});

const getMyLeaves = catchAsync(async (req, res) => {
  const leaves = await LeaveRequest.find({ user: req.user._id })
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

const getUserBalance = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, "User not found");
  const balance = await getBalanceFor(user);
  res.json({ success: true, balance });
});

const getUserLeaves = catchAsync(async (req, res) => {
  const leaves = await LeaveRequest.find({ user: req.params.userId })
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

const applyLeave = catchAsync(async (req, res) => {
  const { fromDate, toDate, reason } = req.body;
  if (new Date(fromDate) > new Date(toDate)) {
    throw new ApiError(400, "From date must be before to date");
  }
  if (new Date(fromDate) < startOfToday()) {
    throw new ApiError(400, "Cannot apply for leave in the past");
  }

  const requestedDays = daysBetween(fromDate, toDate);
  const balance = await getBalanceFor(req.user);
  const unpaidDays = Math.max(0, requestedDays - balance.available);

  const leave = await LeaveRequest.create({
    user: req.user._id,
    fromDate,
    toDate,
    reason,
  });

  if (req.user.manager) {
    await notify({
      userId: req.user.manager,
      message: `${req.user.name} applied for leave: ${formatDate(fromDate)} – ${formatDate(toDate)} (${requestedDays} day${
        requestedDays > 1 ? "s" : ""
      }${unpaidDays > 0 ? `, ${unpaidDays} unpaid` : ""}). Reason: ${reason}`,
      link: "/team/leave-approvals",
    });
  }

  res.status(201).json({ success: true, leave, unpaidDays });
});

const cancelLeave = catchAsync(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave) throw new ApiError(404, "Leave request not found");
  if (leave.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only cancel your own leave requests");
  }
  if (leave.status !== "pending") throw new ApiError(400, "Only pending leave requests can be cancelled");

  await LeaveRequest.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Leave request cancelled" });
});

const getPendingApprovals = catchAsync(async (req, res) => {
  let userFilter = {};
  if (req.user.role === "manager") {
    const team = await User.find({ manager: req.user._id }).select("_id");
    userFilter = { user: { $in: team.map((u) => u._id) } };
  }
  const leaves = await LeaveRequest.find({ status: "pending", ...userFilter })
    .populate("user", "name designation department")
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

const decideLeave = catchAsync(async (req, res) => {
  const { decision } = req.body; // "approved" | "rejected"
  if (!["approved", "rejected"].includes(decision)) throw new ApiError(400, "Invalid decision");

  const leave = await LeaveRequest.findById(req.params.id).populate("user");
  if (!leave) throw new ApiError(404, "Leave request not found");
  if (leave.status !== "pending") throw new ApiError(400, "Leave request already decided");

  let unpaidDays = 0;
  if (decision === "approved") {
    const requestedDays = daysBetween(leave.fromDate, leave.toDate);
    const balance = await getBalanceFor(leave.user);
    unpaidDays = Math.max(0, requestedDays - balance.available);
    leave.unpaidDays = unpaidDays;
  }

  leave.status = decision;
  leave.approvedBy = req.user._id;
  await leave.save();

  const requestedDays = daysBetween(leave.fromDate, leave.toDate);
  const dateRange = `${formatDate(leave.fromDate)} – ${formatDate(leave.toDate)}`;
  const decisionLabel = decision.charAt(0).toUpperCase() + decision.slice(1);
  const unpaidNote = unpaidDays > 0 ? ` (${unpaidDays} day${unpaidDays > 1 ? "s" : ""} unpaid)` : "";

  await notify({
    userId: leave.user._id,
    message: `Your leave request (${dateRange}) was ${decision}${unpaidNote}. Reason: ${leave.reason}`,
    link: "/leave",
    email: leave.user.email,
    emailSubject: `Your Leave Request Has Been ${decisionLabel}`,
    emailBodyHtml: `
      <p>Hi ${leave.user.name},</p>
      <p>Your leave request has been <strong>${decision}</strong>${unpaidNote ? unpaidNote : ""}.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 16px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; width: 90px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #64748b;">Dates</td>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #0f172a; font-weight: bold;">${dateRange}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #64748b;">Days</td>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #0f172a; font-weight: bold;">${requestedDays}${unpaidNote}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #64748b;">Reason</td>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #0f172a; font-weight: bold;">${leave.reason}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #64748b;">Status</td>
          <td style="padding: 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${decision === "approved" ? "#059669" : "#dc2626"}; font-weight: bold;">${decisionLabel}</td>
        </tr>
      </table>
    `,
  });

  // Notify HR of the decision (skip if the decider is HR/Admin themselves)
  if (!["hr", "super_admin"].includes(req.user.role)) {
    const hrUsers = await User.find({ role: { $in: ["hr", "super_admin"] } }).select("_id");
    await Promise.all(
      hrUsers.map((hr) =>
        notify({
          userId: hr._id,
          message: `${leave.user.name}'s leave (${dateRange}) was ${decision} by ${req.user.name}`,
          link: "/hr/reports",
        })
      )
    );
  }

  res.json({ success: true, leave });
});

module.exports = {
  getMyBalance,
  getMyLeaves,
  getUserBalance,
  getUserLeaves,
  applyLeave,
  cancelLeave,
  getPendingApprovals,
  decideLeave,
};
