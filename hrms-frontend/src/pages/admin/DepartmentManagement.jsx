import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../../api/department.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    getDepartmentsApi().then((data) => setDepartments(data.departments));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createDepartmentApi({ name });
      setName("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add department");
    }
  };

  const handleUpdate = async (id) => {
    await updateDepartmentApi(id, { name: editName });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    await deleteDepartmentApi(id);
    load();
  };

  const columns = [
    {
      key: "name",
      label: "Department",
      render: (r) =>
        editingId === r._id ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-accent-500"
            />
            <button onClick={() => handleUpdate(r._id)} className="text-xs text-accent-600 hover:underline">
              Save
            </button>
            <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingId(r._id);
              setEditName(r.name);
            }}
            className="text-slate-700 hover:text-accent-600"
          >
            {r.name}
          </button>
        ),
    },
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
      <h1 className="text-xl font-semibold text-slate-800">Department Management</h1>

      <Card title="Add Department">
        <form onSubmit={handleAdd} className="flex items-end gap-3">
          <Input
            label="Department name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit">
            <Plus size={16} /> Add
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </Card>

      <Card title="Departments">
        <Table columns={columns} rows={departments} />
      </Card>
    </div>
  );
}
