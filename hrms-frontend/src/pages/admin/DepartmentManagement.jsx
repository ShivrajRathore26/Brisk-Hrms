import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../../api/department.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import IconButton from "../../components/common/IconButton";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");

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

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteDepartmentApi(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete department");
    }
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
              autoFocus
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-accent-500"
            />
            <IconButton icon={Check} label="Save" tone="green" onClick={() => handleUpdate(r._id)} />
            <IconButton icon={X} label="Cancel" onClick={() => setEditingId(null)} />
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingId(r._id);
              setEditName(r.name);
            }}
            className="group flex items-center gap-2 text-slate-700 hover:text-accent-600"
          >
            {r.name}
            <Pencil size={13} className="text-slate-300 group-hover:text-accent-500" />
          </button>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <IconButton
          icon={Trash2}
          label="Delete department"
          tone="red"
          onClick={() => {
            setDeleteError("");
            setDeleteTarget(r);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Department Management</h1>

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

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Department"
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
        {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
      </Modal>
    </div>
  );
}
