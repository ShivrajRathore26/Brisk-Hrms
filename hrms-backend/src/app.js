const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const departmentRoutes = require("./routes/department.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const holidayRoutes = require("./routes/holiday.routes");
const assetRoutes = require("./routes/asset.routes");
const reportRoutes = require("./routes/report.routes");
const notificationRoutes = require("./routes/notification.routes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const allowedProductionOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow production frontend
      if (origin === allowedProductionOrigin) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (
        origin.startsWith("https://brisk-hrms-o3zy-") &&
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRMS Backend is running",
    status: "ok"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
