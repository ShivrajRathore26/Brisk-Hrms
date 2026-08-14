import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getHolidaysApi,
  createHolidayApi,
  deleteHolidayApi,
} from "../../api/holiday.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";

const typeOptions = [
  { value: "national", label: "National" },
  { value: "optional", label: "Optional" },
];

export default function HolidayCalendarManage() {
  const now = new Date();
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [form, setForm] = useState({ name: "", date: "", type: "national" });
  const [error, setError] = useState("");

  const load = () => {
    getHolidaysApi({ year }).then((data) => setHolidays(data.holidays));
  };

  useEffect(load, [year]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createHolidayApi(form);
      setForm({ name: "", date: "", type: "national" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleDelete = async (id) => {
    await deleteHolidayApi(id);
    load();
  };

  const columns = [
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" }) },
    { key: "name", label: "Occasion" },
    { key: "type", label: "Type", render: (r) => <Badge tone={r.type === "optional" ? "yellow" : "indigo"}>{r.type}</Badge> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button onClick={() => handleDelete(r._id)} className="text-slate-400 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Holiday Calendar Management</h1>
        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          options={[0, 1].map((i) => {
            const y = now.getFullYear() + i;
            return { value: String(y), label: String(y) };
          })}
          className="w-28"
        />
      </div>

      <Card title="Add Holiday">
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <Input label="Occasion" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select label="Type" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Button type="submit">
            <Plus size={16} /> Add
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </Card>

      <Card title={`Holidays ${year}`}>
        <Table columns={columns} rows={holidays} />
      </Card>
    </div>
  );
}
