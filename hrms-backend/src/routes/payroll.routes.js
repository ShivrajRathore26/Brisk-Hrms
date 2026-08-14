const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  getSalaryStructure,
  upsertSalaryStructure,
  runPayroll,
  getMyPayslips,
  getAllPayslips,
} = require("../controllers/payrollController");

const router = express.Router();

router.use(protect);

router.get("/my-payslips", getMyPayslips);
router.get("/payslips", restrictTo("hr", "super_admin"), getAllPayslips);
router.post("/run", restrictTo("hr", "super_admin"), runPayroll);
router.get("/salary-structure/:userId", restrictTo("hr", "super_admin"), getSalaryStructure);
router.put("/salary-structure/:userId", restrictTo("hr", "super_admin"), upsertSalaryStructure);

module.exports = router;
