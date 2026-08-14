import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { getUsersApi, createUserApi, updateUserApi } from "../../api/user.api";
import { getDepartmentsApi } from "../../api/department.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "super_admin", label: "Super Admin" },
];

const emptyForm = {
  name: "",
  email: "",
  role: "employee",
  department: "",
  designation: "",
  manager: "",
  joiningDate: "",
  status: "active",
};

export default function EmployeeDirectory() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const managers = users.filter((u) => ["manager", "hr", "super_admin"].includes(u.role));

  const load = () => {
    setLoading(true);
    getUsersApi(search ? { search } : {})
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getDepartmentsApi().then((data) => setDepartments(data.departments));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u) => {
    await updateUserApi(u._id, { status: u.status === "active" ? "inactive" : "active" });
    load();
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
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-xs font-medium text-accent-600 hover:underline">
            Edit
          </button>
          <button onClick={() => toggleStatus(r)} className="text-xs font-medium text-slate-500 hover:underline">
            {r.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Employee Directory</h1>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:w-80">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={users} />}
      </Card>

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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
              A temporary password will be generated. The employee should use "Forgot Password" to set their own.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}
