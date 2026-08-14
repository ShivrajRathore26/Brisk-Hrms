const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) throw new ApiError(401, "Not authorized, no token");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Not authorized, invalid token");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== "active") {
    throw new ApiError(401, "Not authorized, user not found or inactive");
  }

  req.user = user;
  next();
});

module.exports = protect;
