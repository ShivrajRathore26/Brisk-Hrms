import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { getSettingsApi, updateSettingsApi } from "../../api/settings.api";
import { getCurrentLocation } from "../../utils/geolocation";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function CompanySettings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    getSettingsApi().then((data) => setSettings(data.settings));
  }, []);

  if (!settings) return <p className="text-sm text-slate-400">Loading...</p>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = await updateSettingsApi(settings);
      setSettings(data.settings);
      setMessage("Settings saved");
    } finally {
      setSaving(false);
    }
  };

  const setAccrualPerMonth = (value) =>
    setSettings({ ...settings, leavePolicy: { ...settings.leavePolicy, accrualPerMonth: Number(value) } });

  const setWorkingHours = (key, value) =>
    setSettings({ ...settings, workingHours: { ...settings.workingHours, [key]: value } });

  const setOfficeLocation = (key, value) =>
    setSettings({ ...settings, officeLocation: { ...settings.officeLocation, [key]: Number(value) } });

  const useMyLocation = async () => {
    setLocateError("");
    setLocating(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setSettings({ ...settings, officeLocation: { ...settings.officeLocation, latitude, longitude } });
    } catch (err) {
      setLocateError(err.message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Company Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Leave Policy">
          <Input
            label="Leaves accrued per month"
            type="number"
            min={0}
            step="0.5"
            value={settings.leavePolicy.accrualPerMonth}
            onChange={(e) => setAccrualPerMonth(e.target.value)}
            className="max-w-xs"
          />
          <p className="mt-2 text-xs text-slate-400">
            Every employee is credited this many leave days each calendar month since joining. Unused leave carries
            forward with no cap or yearly reset.
          </p>
        </Card>

        <Card title="Working Hours & Attendance Policy">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Office Start" type="time" value={settings.workingHours.start} onChange={(e) => setWorkingHours("start", e.target.value)} />
            <Input label="Office End" type="time" value={settings.workingHours.end} onChange={(e) => setWorkingHours("end", e.target.value)} />
            <Input
              label="Grace Period (minutes)"
              type="number"
              min={0}
              value={settings.workingHours.graceMinutes}
              onChange={(e) => setWorkingHours("graceMinutes", Number(e.target.value))}
            />
            <Input
              label="Late Cutoff (half day after)"
              type="time"
              value={settings.workingHours.lateCutoff}
              onChange={(e) => setWorkingHours("lateCutoff", e.target.value)}
            />
            <Input label="Lunch Start" type="time" value={settings.workingHours.lunchStart} onChange={(e) => setWorkingHours("lunchStart", e.target.value)} />
            <Input label="Lunch End" type="time" value={settings.workingHours.lunchEnd} onChange={(e) => setWorkingHours("lunchEnd", e.target.value)} />
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            <li>• Punch in by Office Start + Grace Period → Present</li>
            <li>• Punch in after that but before Late Cutoff → Late</li>
            <li>• Punch in at/after Late Cutoff → Half Day</li>
            <li>• Punch out before Lunch End → Half Day (left early, never came back)</li>
          </ul>
        </Card>

        <Card
          title="Office Location"
          action={
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-600 hover:underline disabled:opacity-50"
            >
              <LocateFixed size={14} /> {locating ? "Locating..." : "Use my current location"}
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              value={settings.officeLocation.latitude}
              onChange={(e) => setOfficeLocation("latitude", e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              value={settings.officeLocation.longitude}
              onChange={(e) => setOfficeLocation("longitude", e.target.value)}
            />
            <Input
              label="Radius (meters)"
              type="number"
              min={0}
              value={settings.officeLocation.radiusMeters}
              onChange={(e) => setOfficeLocation("radiusMeters", e.target.value)}
            />
          </div>
          {locateError && <p className="mt-2 text-xs text-red-500">{locateError}</p>}
          <p className="mt-2 text-xs text-slate-400">
            Employees can only punch in/out from within this radius of the office coordinates.
          </p>
        </Card>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
