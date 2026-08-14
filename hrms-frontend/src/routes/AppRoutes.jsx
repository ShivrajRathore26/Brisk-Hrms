import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";
import Layout from "../components/layout/Layout";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";
import MyProfile from "../pages/profile/MyProfile";
import AttendanceHistory from "../pages/attendance/AttendanceHistory";
import LeaveManagement from "../pages/leave/LeaveManagement";
import MyPayslips from "../pages/payroll/MyPayslips";
import MyAssets from "../pages/assets/MyAssets";

import TeamAttendance from "../pages/manager/TeamAttendance";
import LeaveApproval from "../pages/manager/LeaveApproval";
import TeamDirectory from "../pages/manager/TeamDirectory";

import EmployeeDirectory from "../pages/hr/EmployeeDirectory";
import PayrollProcessing from "../pages/hr/PayrollProcessing";
import AssetInventory from "../pages/hr/AssetInventory";
import HolidayCalendarManage from "../pages/hr/HolidayCalendarManage";
import ReportsCenter from "../pages/hr/ReportsCenter";

import DepartmentManagement from "../pages/admin/DepartmentManagement";
import RoleManagement from "../pages/admin/RoleManagement";
import CompanySettings from "../pages/admin/CompanySettings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/attendance" element={<AttendanceHistory />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/payslips" element={<MyPayslips />} />
          <Route path="/my-assets" element={<MyAssets />} />

          <Route element={<RoleGuard allow={["manager", "hr", "super_admin"]} />}>
            <Route path="/team/attendance" element={<TeamAttendance />} />
            <Route path="/team/leave-approvals" element={<LeaveApproval />} />
            <Route path="/team/directory" element={<TeamDirectory />} />
          </Route>

          <Route element={<RoleGuard allow={["hr", "super_admin"]} />}>
            <Route path="/hr/employees" element={<EmployeeDirectory />} />
            <Route path="/hr/payroll" element={<PayrollProcessing />} />
            <Route path="/hr/assets" element={<AssetInventory />} />
            <Route path="/hr/holidays" element={<HolidayCalendarManage />} />
          </Route>
          <Route element={<RoleGuard allow={["hr", "super_admin", "manager"]} />}>
            <Route path="/hr/reports" element={<ReportsCenter />} />
          </Route>

          <Route element={<RoleGuard allow={["super_admin"]} />}>
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/settings" element={<CompanySettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
