const express = require("express");
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");
const upload = require("../middleware/upload");
const {
  getUsers,
  getTeam,
  getUserById,
  createUser,
  updateUser,
  updateMyProfile,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("super_admin", "hr"), getUsers);
router.get("/team", restrictTo("manager", "hr", "super_admin"), getTeam);
router.post("/", restrictTo("super_admin", "hr"), createUser);
router.put("/me", upload.single("profilePhoto"), updateMyProfile);
router.get("/:id", getUserById);
router.put("/:id", restrictTo("super_admin", "hr"), updateUser);

module.exports = router;
