const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveBalance = require("../models/LeaveBalance");
const User = require("../models/User");
const notify = require("../utils/notify");

function daysBetween(from, to) {
  const ms = new Date(to) - new Date(from);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

const getMyBalance = catchAsync(async (req, res) => {
  const year = new Date().getFullYear();
  const balances = await LeaveBalance.find({ user: req.user._id, year });
  res.json({ success: true, balances });
});

const getMyLeaves = catchAsync(async (req, res) => {
  const leaves = await LeaveRequest.find({ user: req.user._id })
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

const applyLeave = catchAsync(async (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;
  if (new Date(fromDate) > new Date(toDate)) {
    throw new ApiError(400, "From date must be before to date");
  }

  const year = new Date(fromDate).getFullYear();
  const balance = await LeaveBalance.findOne({ user: req.user._id, leaveType, year });
  const requestedDays = daysBetween(fromDate, toDate);
  if (balance && balance.used + requestedDays > balance.total) {
    throw new ApiError(400, `Insufficient ${leaveType} leave balance`);
  }

  const leave = await LeaveRequest.create({
    user: req.user._id,
    leaveType,
    fromDate,
    toDate,
    reason,
  });

  if (req.user.manager) {
    await notify({
      userId: req.user.manager,
      message: `${req.user.name} applied for ${leaveType} leave (${requestedDays} day${requestedDays > 1 ? "s" : ""})`,
      link: "/team/leave-approvals",
    });
  }

  res.status(201).json({ success: true, leave });
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

  leave.status = decision;
  leave.approvedBy = req.user._id;
  await leave.save();

  if (decision === "approved") {
    const year = new Date(leave.fromDate).getFullYear();
    const days = daysBetween(leave.fromDate, leave.toDate);
    await LeaveBalance.updateOne(
      { user: leave.user._id, leaveType: leave.leaveType, year },
      { $inc: { used: days } }
    );
  }

  await notify({
    userId: leave.user._id,
    message: `Your ${leave.leaveType} leave request was ${decision}`,
    link: "/leave",
    email: leave.user.email,
    emailSubject: `Leave request ${decision}`,
  });

  // Notify HR of the decision (skip if the decider is HR/Admin themselves)
  if (!["hr", "super_admin"].includes(req.user.role)) {
    const hrUsers = await User.find({ role: { $in: ["hr", "super_admin"] } }).select("_id");
    await Promise.all(
      hrUsers.map((hr) =>
        notify({
          userId: hr._id,
          message: `${leave.user.name}'s ${leave.leaveType} leave was ${decision} by ${req.user.name}`,
          link: "/hr/reports",
        })
      )
    );
  }

  res.json({ success: true, leave });
});

module.exports = { getMyBalance, getMyLeaves, applyLeave, getPendingApprovals, decideLeave };
