const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  getMyBalance,
  getMyLeaves,
  getUserBalance,
  getUserLeaves,
  applyLeave,
  cancelLeave,
  getPendingApprovals,
  decideLeave,
} = require("../controllers/leaveController");

const router = express.Router();

router.use(protect);

router.get("/my-balance", getMyBalance);
router.get("/mine", getMyLeaves);
router.post("/", applyLeave);
router.delete("/:id", cancelLeave);
router.get("/pending", restrictTo("manager", "hr", "super_admin"), getPendingApprovals);
router.put("/:id/decide", restrictTo("manager", "hr", "super_admin"), decideLeave);
router.get("/balance/:userId", restrictTo("hr", "super_admin"), getUserBalance);
router.get("/user/:userId", restrictTo("hr", "super_admin"), getUserLeaves);

module.exports = router;
