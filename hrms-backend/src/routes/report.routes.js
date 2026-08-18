const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const { attendanceReport, leaveReport, assetReport } = require("../controllers/reportController");

const router = express.Router();

router.use(protect);

router.get("/attendance", restrictTo("manager", "hr", "super_admin"), attendanceReport);
router.get("/leave", restrictTo("manager", "hr", "super_admin"), leaveReport);
router.get("/assets", restrictTo("hr", "super_admin"), assetReport);

module.exports = router;
