import { useEffect, useState } from "react";
import { getTeamApi } from "../../api/user.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

export default function TeamDirectory() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamApi()
      .then((data) => setTeam(data.users))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "designation", label: "Designation", render: (r) => r.designation || "—" },
    { key: "department", label: "Department", render: (r) => r.department?.name || "—" },
    { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Team Directory</h1>
      <Card>
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={team} />}
      </Card>
    </div>
  );
}
