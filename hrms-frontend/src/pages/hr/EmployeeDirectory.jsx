import { useEffect, useState } from "react";
import { Plus, Search, Pencil, UserCheck, UserX } from "lucide-react";
import { getUsersApi, createUserApi, updateUserApi } from "../../api/user.api";
import { getDepartmentsApi } from "../../api/department.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import IconButton from "../../components/common/IconButton";
import EmployeeDetailModal from "../../components/hr/EmployeeDetailModal";

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "super_admin", label: "Super Admin" },
];

const statusFilterOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  department: "",
  designation: "",
  manager: "",
  joiningDate: "",
  status: "active",
};

export default function EmployeeDirectory() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  const load = () => {
    setLoading(true);
    getUsersApi({
      search: search || undefined,
      department: departmentFilter || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    })
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  // Independent of the directory's filtered `users` list, so the "Reporting Manager" picker in
  // the Add/Edit modal always shows every eligible manager regardless of active directory filters.
  const loadManagers = () => {
    getUsersApi({ status: "active" }).then((data) =>
      setManagers(data.users.filter((u) => ["manager", "hr", "super_admin"].includes(u.role)))
    );
  };

  useEffect(() => {
    getDepartmentsApi().then((data) => setDepartments(data.departments));
    loadManagers();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, departmentFilter, roleFilter, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingId(u._id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      department: u.department?._id || "",
      designation: u.designation || "",
      manager: u.manager?._id || "",
      joiningDate: u.joiningDate ? u.joiningDate.slice(0, 10) : "",
      status: u.status,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateUserApi(editingId, form);
      } else {
        await createUserApi(form);
      }
      setModalOpen(false);
      load();
      loadManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u) => {
    await updateUserApi(u._id, { status: u.status === "active" ? "inactive" : "active" });
    load();
    loadManagers();
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department", render: (r) => r.department?.name || "—" },
    { key: "role", label: "Role", render: (r) => <span className="capitalize">{r.role.replace("_", " ")}</span> },
    { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <IconButton icon={Pencil} label="Edit employee" tone="accent" onClick={() => openEdit(r)} />
          <IconButton
            icon={r.status === "active" ? UserX : UserCheck}
            label={r.status === "active" ? "Deactivate employee" : "Activate employee"}
            tone={r.status === "active" ? "red" : "green"}
            onClick={() => toggleStatus(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employee Directory</h1>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:w-72">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <Select
            placeholder="All departments"
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-44"
          />
          <Select
            placeholder="All roles"
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-40"
          />
          <Select
            placeholder="All statuses"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          />
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <Table columns={columns} rows={users} onRowClick={(u) => setDetailUserId(u._id)} />
        )}
      </Card>

      {detailUserId && (
        <EmployeeDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Employee" : "Add Employee"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Email"
            type="email"
            required
            disabled={!!editingId}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {!editingId && (
            <Input
              label="Set Password"
              type="text"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Temporary password to share with the employee"
            />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              options={roleOptions}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Select
              label="Department"
              placeholder="Select department"
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
            <Select
              label="Reporting Manager"
              placeholder="None"
              options={managers.map((m) => ({ value: m._id, label: m.name }))}
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
            />
          </div>
          <Input
            label="Joining Date"
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />
          {!editingId && (
            <p className="text-xs text-slate-400">
              Share this password with the employee yourself (WhatsApp, in person, etc). They can change it anytime
              from My Profile after logging in.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
