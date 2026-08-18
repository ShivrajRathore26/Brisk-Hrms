import { useEffect, useState } from "react";
import { Plus, UserPlus, Undo2, RefreshCw, Pencil, Trash2 } from "lucide-react";
import {
  getAssetsApi,
  createAssetApi,
  assignAssetApi,
  returnAssetApi,
  updateAssetApi,
  deleteAssetApi,
} from "../../api/asset.api";
import { getUsersApi } from "../../api/user.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import IconButton from "../../components/common/IconButton";

const defaultTypes = ["laptop", "monitor", "mouse", "keyboard", "other"];

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
  const [addForm, setAddForm] = useState({ assetType: "laptop", modelName: "", serialNumber: "", description: "" });
  const [addError, setAddError] = useState("");

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignUserId, setAssignUserId] = useState("");

  const [returnTarget, setReturnTarget] = useState(null);
  const [returnStatus, setReturnStatus] = useState("available");

  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("available");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ assetType: "", modelName: "", serialNumber: "", description: "" });
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Suggestions = the common presets plus whatever custom types HR has already introduced,
  // so a type only ever needs to be typed once.
  const knownTypes = Array.from(new Set([...defaultTypes, ...assets.map((a) => a.assetType)])).sort();
  const typeFilterOptions = knownTypes.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

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
    const assetType = addForm.assetType.trim().toLowerCase();
    if (!assetType) {
      setAddError("Asset type is required");
      return;
    }
    try {
      await createAssetApi({ ...addForm, assetType });
      setAddOpen(false);
      setAddForm({ assetType: "laptop", modelName: "", serialNumber: "", description: "" });
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

  const openStatusChange = (asset) => {
    setStatusTarget(asset);
    setNewStatus("available");
  };

  const handleUpdateStatus = async () => {
    await updateAssetApi(statusTarget._id, { status: newStatus });
    setStatusTarget(null);
    load();
  };

  const openEdit = (asset) => {
    setEditTarget(asset);
    setEditError("");
    setEditForm({
      assetType: asset.assetType || "",
      modelName: asset.modelName || "",
      serialNumber: asset.serialNumber || "",
      description: asset.description || "",
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    const assetType = editForm.assetType.trim().toLowerCase();
    if (!assetType) {
      setEditError("Asset type is required");
      return;
    }
    try {
      await updateAssetApi(editTarget._id, { ...editForm, assetType });
      setEditTarget(null);
      load();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update asset");
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteAssetApi(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete asset");
    }
  };

  const columns = [
    { key: "assetType", label: "Type", render: (r) => <span className="capitalize">{r.assetType}</span> },
    { key: "modelName", label: "Model", render: (r) => r.modelName || <span className="italic text-slate-400">{r.description || "—"}</span> },
    { key: "serialNumber", label: "Serial No.", render: (r) => r.serialNumber || "—" },
    { key: "assignedTo", label: "Assigned To", render: (r) => r.assignedTo?.name || "—" },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === "available" ? (
            <IconButton icon={UserPlus} label="Assign to employee" tone="accent" onClick={() => setAssignTarget(r)} />
          ) : r.status === "assigned" ? (
            <IconButton icon={Undo2} label="Mark as returned" onClick={() => setReturnTarget(r)} />
          ) : (
            <IconButton icon={RefreshCw} label="Update status" tone="accent" onClick={() => openStatusChange(r)} />
          )}
          <IconButton icon={Pencil} label="Edit asset" onClick={() => openEdit(r)} />
          <IconButton
            icon={Trash2}
            label="Delete asset"
            tone="red"
            onClick={() => {
              setDeleteError("");
              setDeleteTarget(r);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Asset Inventory</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add New Asset
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <Select placeholder="All statuses" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44" />
          <Select placeholder="All types" options={typeFilterOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
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
          <Input
            label="Type"
            list="asset-type-suggestions"
            required
            value={addForm.assetType}
            onChange={(e) => setAddForm({ ...addForm, assetType: e.target.value })}
            placeholder="e.g. Laptop, Chair, Projector..."
          />
          <datalist id="asset-type-suggestions">
            {knownTypes.map((t) => (
              <option key={t} value={t.charAt(0).toUpperCase() + t.slice(1)} />
            ))}
          </datalist>
          <p className="-mt-2 text-xs text-slate-400">
            Pick a suggestion or type a new device type — it'll be remembered for next time.
          </p>
          <Input
            label="Model"
            value={addForm.modelName}
            onChange={(e) => setAddForm({ ...addForm, modelName: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Serial Number"
            value={addForm.serialNumber}
            onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })}
            placeholder="Optional"
          />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Description</span>
            <textarea
              rows={3}
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="Any extra details — useful if this asset has no model/serial number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </label>
          {addError && <p className="text-sm text-red-500">{addError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign ${assignTarget?.modelName || assignTarget?.description || ""}`}
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
          options={users.filter((u) => u.status === "active").map((u) => ({ value: u._id, label: u.name }))}
          value={assignUserId}
          onChange={(e) => setAssignUserId(e.target.value)}
        />
      </Modal>

      <Modal
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title={`Return ${returnTarget?.modelName || returnTarget?.description || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button onClick={handleReturn}>Confirm Return</Button>
          </>
        }
      >
        <Select label="Condition on return" options={statusOptions.filter((o) => o.value !== "assigned")} value={returnStatus} onChange={(e) => setReturnStatus(e.target.value)} />
      </Modal>

      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={`Update Status — ${statusTarget?.modelName || statusTarget?.description || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusTarget(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Save</Button>
          </>
        }
      >
        <Select
          label="New status"
          options={statusOptions.filter((o) => o.value !== "assigned")}
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        />
        <p className="mt-2 text-xs text-slate-400">
          For example, mark a repaired item back to "Available" so it can be assigned again.
        </p>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.modelName || editTarget?.description || "Asset"}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Type"
            list="asset-type-suggestions"
            required
            value={editForm.assetType}
            onChange={(e) => setEditForm({ ...editForm, assetType: e.target.value })}
            placeholder="e.g. Laptop, Chair, Projector..."
          />
          <Input
            label="Model"
            value={editForm.modelName}
            onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Serial Number"
            value={editForm.serialNumber}
            onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
            placeholder="Optional"
          />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Description</span>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Any extra details — useful if this asset has no model/serial number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </label>
          {editError && <p className="text-sm text-red-500">{editError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Asset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-800">
            {deleteTarget?.modelName || deleteTarget?.description || "this asset"}
          </span>
          ? This action cannot be undone.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}
      </Modal>
    </div>
  );
}
