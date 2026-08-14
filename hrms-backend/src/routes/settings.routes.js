const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const { getSettings, updateSettings } = require("../controllers/settingsController");

const router = express.Router();

router.use(protect);

router.get("/", getSettings);
router.put("/", restrictTo("super_admin"), updateSettings);

module.exports = router;
