import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    getUsersApi()
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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
          className="!py-1"
        />
      ),
    },
    { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Roles & Permissions</h1>
        <p className="text-sm text-slate-400">Assign each user's role: Super Admin, HR, Manager, or Employee.</p>
      </div>
      <Card>
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={users} />}
      </Card>
    </div>
  );
}
