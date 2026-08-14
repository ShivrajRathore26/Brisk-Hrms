const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const Holiday = require("../models/Holiday");

const getHolidays = catchAsync(async (req, res) => {
  const { year } = req.query;
  const filter = {};
  if (year) {
    filter.date = {
      $gte: new Date(Number(year), 0, 1),
      $lt: new Date(Number(year) + 1, 0, 1),
    };
  }
  const holidays = await Holiday.find(filter).sort({ date: 1 });
  res.json({ success: true, holidays });
});

const getUpcoming = catchAsync(async (req, res) => {
  const holidays = await Holiday.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(5);
  res.json({ success: true, holidays });
});

const createHoliday = catchAsync(async (req, res) => {
  const { name, date, type } = req.body;
  const holiday = await Holiday.create({ name, date, type });
  res.status(201).json({ success: true, holiday });
});

const updateHoliday = catchAsync(async (req, res) => {
  const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!holiday) throw new ApiError(404, "Holiday not found");
  res.json({ success: true, holiday });
});

const deleteHoliday = catchAsync(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) throw new ApiError(404, "Holiday not found");
  res.json({ success: true, message: "Holiday deleted" });
});

module.exports = { getHolidays, getUpcoming, createHoliday, updateHoliday, deleteHoliday };
