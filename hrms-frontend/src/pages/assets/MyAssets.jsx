import { useEffect, useState } from "react";
import { Laptop, Monitor, Mouse, Keyboard, Package } from "lucide-react";
import { getMyAssetsApi } from "../../api/asset.api";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";

const icons = { laptop: Laptop, monitor: Monitor, mouse: Mouse, keyboard: Keyboard, other: Package };

export default function MyAssets() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssetsApi()
      .then((data) => setAssignments(data.assignments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My Assigned Assets</h1>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : assignments.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-slate-400">No assets currently assigned to you</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => {
            const Icon = icons[a.asset.assetType] || Package;
            return (
              <Card key={a._id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium capitalize text-slate-700">{a.asset.assetType}</p>
                    <p className="text-sm text-slate-500">{a.asset.modelName || a.asset.description || "—"}</p>
                    {a.asset.serialNumber && <p className="text-xs text-slate-400">S/N: {a.asset.serialNumber}</p>}
                    <p className="mt-1 text-xs text-slate-400">
                      Assigned {formatDate(a.assignedDate)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
