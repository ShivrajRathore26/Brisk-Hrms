const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const Department = require("../models/Department");

const getDepartments = catchAsync(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ success: true, departments });
});

const createDepartment = catchAsync(async (req, res) => {
  const { name } = req.body;
  const exists = await Department.findOne({ name });
  if (exists) throw new ApiError(400, "Department already exists");
  const department = await Department.create({ name });
  res.status(201).json({ success: true, department });
});

const updateDepartment = catchAsync(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  if (!department) throw new ApiError(404, "Department not found");
  res.json({ success: true, department });
});

const deleteDepartment = catchAsync(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");
  res.json({ success: true, message: "Department deleted" });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
