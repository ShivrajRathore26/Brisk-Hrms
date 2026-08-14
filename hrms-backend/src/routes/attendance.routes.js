const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  punchIn,
  punchOut,
  getTodayStatus,
  getMyHistory,
  getTeamAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(protect);

router.post("/punch-in", punchIn);
router.post("/punch-out", punchOut);
router.get("/today", getTodayStatus);
router.get("/history", getMyHistory);
router.get("/team", restrictTo("manager", "hr", "super_admin"), getTeamAttendance);

module.exports = router;
