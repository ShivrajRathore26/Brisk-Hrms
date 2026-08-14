const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  getHolidays,
  getUpcoming,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

const router = express.Router();

router.use(protect);

router.get("/", getHolidays);
router.get("/upcoming", getUpcoming);
router.post("/", restrictTo("hr", "super_admin"), createHoliday);
router.put("/:id", restrictTo("hr", "super_admin"), updateHoliday);
router.delete("/:id", restrictTo("hr", "super_admin"), deleteHoliday);

module.exports = router;
