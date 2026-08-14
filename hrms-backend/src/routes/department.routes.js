const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const router = express.Router();

router.use(protect);

router.get("/", getDepartments);
router.post("/", restrictTo("super_admin"), createDepartment);
router.put("/:id", restrictTo("super_admin"), updateDepartment);
router.delete("/:id", restrictTo("super_admin"), deleteDepartment);

module.exports = router;
