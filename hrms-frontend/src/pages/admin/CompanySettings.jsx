import { useEffect, useState } from "react";
import { getSettingsApi, updateSettingsApi } from "../../api/settings.api";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function CompanySettings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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

  const setLeave = (type, value) =>
    setSettings({ ...settings, leavePolicy: { ...settings.leavePolicy, [type]: Number(value) } });

  const setWorkingHours = (key, value) =>
    setSettings({ ...settings, workingHours: { ...settings.workingHours, [key]: value } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Company Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Leave Policy (days per year)">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Sick" type="number" min={0} value={settings.leavePolicy.sick} onChange={(e) => setLeave("sick", e.target.value)} />
            <Input label="Casual" type="number" min={0} value={settings.leavePolicy.casual} onChange={(e) => setLeave("casual", e.target.value)} />
            <Input label="Earned" type="number" min={0} value={settings.leavePolicy.earned} onChange={(e) => setLeave("earned", e.target.value)} />
          </div>
        </Card>

        <Card title="Working Hours">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start" type="time" value={settings.workingHours.start} onChange={(e) => setWorkingHours("start", e.target.value)} />
            <Input label="End" type="time" value={settings.workingHours.end} onChange={(e) => setWorkingHours("end", e.target.value)} />
          </div>
        </Card>

        <Card title="Tax Slabs (annual gross pay)">
          <div className="space-y-3">
            {settings.taxRules.slabs.map((slab, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <Input
                  label={`Slab ${i + 1} up to`}
                  type="number"
                  value={slab.upTo === null ? "" : slab.upTo}
                  disabled={!Number.isFinite(slab.upTo)}
                  onChange={(e) => {
                    const slabs = [...settings.taxRules.slabs];
                    slabs[i] = { ...slabs[i], upTo: Number(e.target.value) };
                    setSettings({ ...settings, taxRules: { ...settings.taxRules, slabs } });
                  }}
                />
                <Input
                  label="Rate (%)"
                  type="number"
                  value={slab.rate}
                  onChange={(e) => {
                    const slabs = [...settings.taxRules.slabs];
                    slabs[i] = { ...slabs[i], rate: Number(e.target.value) };
                    setSettings({ ...settings, taxRules: { ...settings.taxRules, slabs } });
                  }}
                />
              </div>
            ))}
            <p className="text-xs text-slate-400">The final slab applies to all income above the previous slab.</p>
          </div>
        </Card>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
