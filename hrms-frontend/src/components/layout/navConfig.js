import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  Laptop,
  Users,
  ClipboardCheck,
  UsersRound,
  Boxes,
  FileBarChart,
  Building2,
  ShieldCheck,
  Settings,
} from "lucide-react";

// Every entry lists the roles allowed to see it, matching the PDF's permission matrix.
export const navSections = [
  {
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "hr", "manager", "employee"] },
      { to: "/profile", label: "My Profile", icon: User, roles: ["super_admin", "hr", "manager", "employee"] },
    ],
  },
  {
    title: "Attendance & Leave",
    items: [
      { to: "/attendance", label: "Attendance History", icon: CalendarCheck, roles: ["super_admin", "hr", "manager", "employee"] },
      { to: "/leave", label: "Leave", icon: CalendarDays, roles: ["super_admin", "hr", "manager", "employee"] },
      { to: "/my-assets", label: "My Assets", icon: Laptop, roles: ["super_admin", "hr", "manager", "employee"] },
    ],
  },
  {
    title: "Team",
    items: [
      { to: "/team/attendance", label: "Team Attendance", icon: Users, roles: ["manager", "hr", "super_admin"] },
      { to: "/team/leave-approvals", label: "Leave Approvals", icon: ClipboardCheck, roles: ["manager", "hr", "super_admin"] },
      { to: "/team/directory", label: "Team Directory", icon: UsersRound, roles: ["manager", "hr", "super_admin"] },
    ],
  },
  {
    title: "HR",
    items: [
      { to: "/hr/employees", label: "Employee Directory", icon: Users, roles: ["hr", "super_admin"] },
      { to: "/hr/assets", label: "Asset Inventory", icon: Boxes, roles: ["hr", "super_admin"] },
      { to: "/hr/holidays", label: "Holiday Calendar", icon: CalendarDays, roles: ["hr", "super_admin"] },
      { to: "/hr/reports", label: "Reports Center", icon: FileBarChart, roles: ["hr", "super_admin", "manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/departments", label: "Departments", icon: Building2, roles: ["super_admin"] },
      { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, roles: ["super_admin"] },
      { to: "/admin/settings", label: "Company Settings", icon: Settings, roles: ["super_admin"] },
    ],
  },
];
