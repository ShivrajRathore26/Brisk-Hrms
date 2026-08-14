const express = require("express");
const protect = require("../middleware/auth");
const {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

module.exports = router;
