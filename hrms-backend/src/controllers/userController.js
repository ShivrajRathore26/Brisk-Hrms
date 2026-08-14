const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const LeaveBalance = require("../models/LeaveBalance");
const CompanySettings = require("../models/CompanySettings");

const getUsers = catchAsync(async (req, res) => {
  const { search, department, role, status } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter)
    .populate("department", "name")
    .populate("manager", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, users });
});

const getTeam = catchAsync(async (req, res) => {
  const team = await User.find({ manager: req.user._id }).populate("department", "name");
  res.json({ success: true, users: team });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("department", "name")
    .populate("manager", "name");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role, department, designation, manager, joiningDate } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, "A user with this email already exists");

  const user = await User.create({
    name,
    email,
    password: password || Math.random().toString(36).slice(-10),
    role,
    department: department || undefined,
    designation,
    manager: manager || undefined,
    joiningDate,
  });

  const year = new Date().getFullYear();
  const settings = (await CompanySettings.findOne()) || { leavePolicy: { sick: 12, casual: 12, earned: 15 } };
  await LeaveBalance.insertMany(
    ["sick", "casual", "earned"].map((leaveType) => ({
      user: user._id,
      leaveType,
      total: settings.leavePolicy[leaveType],
      used: 0,
      year,
    }))
  );

  res.status(201).json({ success: true, user });
});

const updateUser = catchAsync(async (req, res) => {
  const { name, role, department, designation, manager, status, joiningDate } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (department !== undefined) user.department = department;
  if (designation !== undefined) user.designation = designation;
  if (manager !== undefined) user.manager = manager || null;
  if (status !== undefined) user.status = status;
  if (joiningDate !== undefined) user.joiningDate = joiningDate;

  await user.save();
  res.json({ success: true, user });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, designation } = req.body;
  if (name !== undefined) user.name = name;
  if (designation !== undefined) user.designation = designation;
  if (req.file) user.profilePhoto = req.file.path;
  await user.save();
  res.json({ success: true, user });
});

module.exports = { getUsers, getTeam, getUserById, createUser, updateUser, updateMyProfile };
