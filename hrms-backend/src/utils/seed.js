require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");
const CompanySettings = require("../models/CompanySettings");
const Holiday = require("../models/Holiday");

const SEED_PASSWORD = "Password@123";

async function upsertUser({ name, email, role, department, designation, manager }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: SEED_PASSWORD,
      role,
      department,
      designation,
      manager: manager || null,
      status: "active",
    });
    console.log(`Created ${role}: ${email}`);
  } else {
    console.log(`Already exists (${role}): ${email}`);
  }
  return user;
}

async function seed() {
  await connectDB();

  let settings = await CompanySettings.findOne();
  if (!settings) {
    settings = await CompanySettings.create({});
    console.log("Created default company settings");
  }

  let engineering = await Department.findOne({ name: "Engineering" });
  if (!engineering) engineering = await Department.create({ name: "Engineering" });

  const superAdmin = await upsertUser({
    name: "Aditi Rao",
    email: "superadmin@hrms.test",
    role: "super_admin",
    department: engineering._id,
    designation: "Founder",
  });

  const hr = await upsertUser({
    name: "Neha Kapoor",
    email: "hr@hrms.test",
    role: "hr",
    department: engineering._id,
    designation: "HR Manager",
  });

  const manager = await upsertUser({
    name: "Rahul Verma",
    email: "manager@hrms.test",
    role: "manager",
    department: engineering._id,
    designation: "Engineering Manager",
  });

  await upsertUser({
    name: "Sam Iyer",
    email: "employee@hrms.test",
    role: "employee",
    department: engineering._id,
    designation: "Software Engineer",
    manager: manager._id,
  });

  const holidayCount = await Holiday.countDocuments();
  if (holidayCount === 0) {
    const year = new Date().getFullYear();
    await Holiday.insertMany([
      { name: "New Year's Day", date: new Date(year, 0, 1), type: "national" },
      { name: "Independence Day", date: new Date(year, 7, 15), type: "national" },
      { name: "Founder's Day", date: new Date(year, 10, 1), type: "optional" },
    ]);
    console.log("Seeded sample holidays");
  }

  console.log("\nSeed complete. Login with any of these (password: Password@123):");
  console.log("  super_admin -> superadmin@hrms.test");
  console.log("  hr          -> hr@hrms.test");
  console.log("  manager     -> manager@hrms.test");
  console.log("  employee    -> employee@hrms.test");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
