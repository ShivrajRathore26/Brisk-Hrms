const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const Asset = require("../models/Asset");
const AssetAssignment = require("../models/AssetAssignment");
const notify = require("../utils/notify");

const getAssets = catchAsync(async (req, res) => {
  const { status, assetType } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assetType) filter.assetType = assetType;

  const assets = await Asset.find(filter).sort({ createdAt: -1 });

  const activeAssignments = await AssetAssignment.find({
    asset: { $in: assets.map((a) => a._id) },
    returnedDate: null,
  }).populate("user", "name");

  const assignmentByAsset = Object.fromEntries(activeAssignments.map((a) => [a.asset.toString(), a]));

  res.json({
    success: true,
    assets: assets.map((a) => {
      const assignment = assignmentByAsset[a._id.toString()];
      return {
        ...a.toObject(),
        assignedTo: assignment?.user || null,
        activeAssignmentId: assignment?._id || null,
      };
    }),
  });
});

const createAsset = catchAsync(async (req, res) => {
  const { assetType, modelName, serialNumber } = req.body;
  const exists = await Asset.findOne({ serialNumber });
  if (exists) throw new ApiError(400, "An asset with this serial number already exists");
  const asset = await Asset.create({ assetType, modelName, serialNumber });
  res.status(201).json({ success: true, asset });
});

const updateAsset = catchAsync(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!asset) throw new ApiError(404, "Asset not found");
  res.json({ success: true, asset });
});

const assignAsset = catchAsync(async (req, res) => {
  const { assetId, userId, conditionNotes } = req.body;
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  if (asset.status !== "available") throw new ApiError(400, "Asset is not available for assignment");

  const assignment = await AssetAssignment.create({
    asset: assetId,
    user: userId,
    conditionNotes: conditionNotes || "",
  });

  asset.status = "assigned";
  await asset.save();

  await notify({
    userId,
    message: `You have been assigned a ${asset.assetType}: ${asset.modelName}`,
    link: "/my-assets",
  });

  res.status(201).json({ success: true, assignment });
});

const returnAsset = catchAsync(async (req, res) => {
  const { assignmentId, conditionNotes, assetStatus } = req.body;
  const assignment = await AssetAssignment.findById(assignmentId);
  if (!assignment) throw new ApiError(404, "Assignment not found");
  if (assignment.returnedDate) throw new ApiError(400, "Asset already returned");

  assignment.returnedDate = new Date();
  if (conditionNotes) assignment.conditionNotes = conditionNotes;
  await assignment.save();

  const asset = await Asset.findById(assignment.asset);
  asset.status = assetStatus && ["under_repair", "damaged", "retired"].includes(assetStatus) ? assetStatus : "available";
  await asset.save();

  res.json({ success: true, assignment });
});

const getMyAssets = catchAsync(async (req, res) => {
  const assignments = await AssetAssignment.find({ user: req.user._id, returnedDate: null }).populate("asset");
  res.json({ success: true, assignments });
});

const getAssetHistory = catchAsync(async (req, res) => {
  const assignments = await AssetAssignment.find({ user: req.params.userId })
    .populate("asset")
    .sort({ assignedDate: -1 });
  res.json({ success: true, assignments });
});

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  assignAsset,
  returnAsset,
  getMyAssets,
  getAssetHistory,
};
