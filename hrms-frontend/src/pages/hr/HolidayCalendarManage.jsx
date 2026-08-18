import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getHolidaysApi,
  createHolidayApi,
  updateHolidayApi,
  deleteHolidayApi,
} from "../../api/holiday.api";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import IconButton from "../../components/common/IconButton";

export default function HolidayCalendarManage() {
  const now = new Date();
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [form, setForm] = useState({ name: "", date: "" });
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", date: "" });
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    getHolidaysApi({ year }).then((data) => setHolidays(data.holidays));
  };

  useEffect(load, [year]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createHolidayApi(form);
      setForm({ name: "", date: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add holiday");
    }
  };

  const openEdit = (holiday) => {
    setEditTarget(holiday);
    setEditError("");
    setEditForm({ name: holiday.name, date: holiday.date?.slice(0, 10) || "" });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    try {
      await updateHolidayApi(editTarget._id, editForm);
      setEditTarget(null);
      load();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update holiday");
    }
  };

  const handleDelete = async () => {
    await deleteHolidayApi(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: "date", label: "Date", render: (r) => formatDate(r.date, { weekday: "short", month: "long", day: "numeric" }) },
    { key: "name", label: "Occasion" },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <IconButton icon={Pencil} label="Edit holiday" onClick={() => openEdit(r)} />
          <IconButton icon={Trash2} label="Delete holiday" tone="red" onClick={() => setDeleteTarget(r)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Holiday Calendar Management</h1>
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
          <Button type="submit">
            <Plus size={16} /> Add
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </Card>

      <Card title={`Holidays ${year}`}>
        <Table columns={columns} rows={holidays} />
      </Card>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Holiday"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Occasion" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Date" type="date" required value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
          {editError && <p className="text-sm text-red-500">{editError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Holiday"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-800">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
