const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { buildEmailHtml } = require("../utils/emailTemplate");
const User = require("../models/User");

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.status !== "active") throw new ApiError(403, "Your account is inactive");

  const token = generateToken(user._id);
  const safeUser = await User.findById(user._id).populate("department", "name");

  res.json({ success: true, token, user: safeUser });
});

const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name").populate("manager", "name");
  res.json({ success: true, user });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated" });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your HRMS Password",
        html: buildEmailHtml({
          heading: "Reset your password",
          bodyHtml: `
            <p>Hi ${user.name},</p>
            <p>We received a request to reset the password on your Briskcovey HRMS account. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.</p>
            <p>If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
          `,
          ctaText: "Reset Password",
          ctaUrl: resetUrl,
        }),
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Failed to send reset email:", err.message);
      throw new ApiError(500, "Failed to send reset email — check backend SMTP configuration");
    }
  }

  // Always respond success to avoid leaking which emails exist
  res.json({ success: true, message: "If that email exists, a reset link has been sent" });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw new ApiError(400, "Reset token is invalid or has expired");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
