# HRMS Portal

Custom HRMS for an IT company. Roles: Super Admin, HR, Manager, Employee.

Stack: MongoDB + Express + React (Context API) + Node.js, Cloudinary (files), Gmail SMTP (email), JWT auth.

## Structure

- `hrms-backend/` — Express API (see `src/`)
- `hrms-frontend/` — React app (Vite + Tailwind)

## Setup

### 1. Backend

```
cd hrms-backend
npm install
```

Edit `hrms-backend/.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `SMTP_USER` / `SMTP_PASS` — Gmail address + 16-character App Password

Seed 4 demo users (one per role) plus sample holidays and default company settings:

```
npm run seed
```

This prints the login credentials for `super_admin`, `hr`, `manager`, and `employee` (all use password `Password@123`).

Start the API:

```
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Frontend

```
cd hrms-frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`, pointed at the API via `VITE_API_URL` in `hrms-frontend/.env`.

## Golden path to verify

1. Log in as `employee@hrms.test` → punch in/out on the dashboard, apply for leave.
2. Log in as `manager@hrms.test` → approve the leave request, view team attendance.
3. Log in as `hr@hrms.test` → add an employee, set their salary structure, run payroll, assign an asset.
4. Log in as `super_admin@hrms.test` → manage departments, reassign a role, edit company settings.
