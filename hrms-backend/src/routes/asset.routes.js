const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  getAssets,
  createAsset,
  updateAsset,
  assignAsset,
  returnAsset,
  getMyAssets,
  getAssetHistory,
} = require("../controllers/assetController");

const router = express.Router();

router.use(protect);

router.get("/mine", getMyAssets);
router.get("/", restrictTo("hr", "super_admin"), getAssets);
router.post("/", restrictTo("hr", "super_admin"), createAsset);
router.put("/:id", restrictTo("hr", "super_admin"), updateAsset);
router.post("/assign", restrictTo("hr", "super_admin"), assignAsset);
router.post("/return", restrictTo("hr", "super_admin"), returnAsset);
router.get("/history/:userId", restrictTo("hr", "super_admin"), getAssetHistory);

module.exports = router;
