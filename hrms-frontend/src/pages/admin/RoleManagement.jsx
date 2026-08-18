import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getUsersApi, updateUserApi } from "../../api/user.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "super_admin", label: "Super Admin" },
];

export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    getUsersApi(search ? { search } : {})
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleRoleChange = async (id, role) => {
    setSavingId(id);
    try {
      await updateUserApi(id, { role });
      load();
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department", render: (r) => r.department?.name || "—" },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <Select
          options={roleOptions}
          value={r.role}
          disabled={savingId === r._id}
          onChange={(e) => handleRoleChange(r._id, e.target.value)}
          className="w-40 !py-1"
        />
      ),
    },
    { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Roles & Permissions</h1>
        <p className="text-sm text-slate-400">Assign each user's role: Super Admin, HR, Manager, or Employee.</p>
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
    </div>
  );
}
