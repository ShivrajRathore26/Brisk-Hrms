import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAssetsApi, createAssetApi, assignAssetApi, returnAssetApi } from "../../api/asset.api";
import { getUsersApi } from "../../api/user.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

const typeOptions = [
  { value: "laptop", label: "Laptop" },
  { value: "monitor", label: "Monitor" },
  { value: "mouse", label: "Mouse" },
  { value: "keyboard", label: "Keyboard" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "under_repair", label: "Under Repair" },
  { value: "damaged", label: "Damaged" },
  { value: "retired", label: "Retired" },
];

const statusTone = { available: "green", assigned: "indigo", under_repair: "yellow", damaged: "red", retired: "slate" };

export default function AssetInventory() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ assetType: "laptop", modelName: "", serialNumber: "" });
  const [addError, setAddError] = useState("");

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignUserId, setAssignUserId] = useState("");

  const [returnTarget, setReturnTarget] = useState(null);
  const [returnStatus, setReturnStatus] = useState("available");

  const load = () => {
    setLoading(true);
    getAssetsApi({ status: statusFilter || undefined, assetType: typeFilter || undefined })
      .then((data) => setAssets(data.assets))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getUsersApi().then((data) => setUsers(data.users));
  }, []);

  useEffect(load, [statusFilter, typeFilter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError("");
    try {
      await createAssetApi(addForm);
      setAddOpen(false);
      setAddForm({ assetType: "laptop", modelName: "", serialNumber: "" });
      load();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add asset");
    }
  };

  const handleAssign = async () => {
    await assignAssetApi({ assetId: assignTarget._id, userId: assignUserId });
    setAssignTarget(null);
    setAssignUserId("");
    load();
  };

  const handleReturn = async () => {
    await returnAssetApi({ assignmentId: returnTarget.activeAssignmentId, assetStatus: returnStatus });
    setReturnTarget(null);
    load();
  };

  const columns = [
    { key: "assetType", label: "Type", render: (r) => <span className="capitalize">{r.assetType}</span> },
    { key: "modelName", label: "Model" },
    { key: "serialNumber", label: "Serial No." },
    { key: "assignedTo", label: "Assigned To", render: (r) => r.assignedTo?.name || "—" },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        r.status === "available" ? (
          <button onClick={() => setAssignTarget(r)} className="text-xs font-medium text-accent-600 hover:underline">
            Assign
          </button>
        ) : r.status === "assigned" ? (
          <button onClick={() => setReturnTarget(r)} className="text-xs font-medium text-slate-500 hover:underline">
            Return
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Asset Inventory</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add New Asset
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <Select placeholder="All statuses" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44" />
          <Select placeholder="All types" options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
        </div>
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={assets} />}
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Asset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Asset</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Select label="Type" options={typeOptions} value={addForm.assetType} onChange={(e) => setAddForm({ ...addForm, assetType: e.target.value })} />
          <Input label="Model" required value={addForm.modelName} onChange={(e) => setAddForm({ ...addForm, modelName: e.target.value })} />
          <Input label="Serial Number" required value={addForm.serialNumber} onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })} />
          {addError && <p className="text-sm text-red-500">{addError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign ${assignTarget?.modelName || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignUserId}>Assign</Button>
          </>
        }
      >
        <Select
          label="Assign to"
          placeholder="Select employee"
          options={users.map((u) => ({ value: u._id, label: u.name }))}
          value={assignUserId}
          onChange={(e) => setAssignUserId(e.target.value)}
        />
      </Modal>

      <Modal
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title={`Return ${returnTarget?.modelName || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button onClick={handleReturn}>Confirm Return</Button>
          </>
        }
      >
        <Select label="Condition on return" options={statusOptions.filter((o) => o.value !== "assigned")} value={returnStatus} onChange={(e) => setReturnStatus(e.target.value)} />
      </Modal>
    </div>
  );
}
