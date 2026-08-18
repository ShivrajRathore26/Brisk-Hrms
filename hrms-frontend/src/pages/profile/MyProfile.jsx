import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateMyProfileApi } from "../../api/user.api";
import { changePasswordApi as changePasswordAuthApi } from "../../api/auth.api";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Camera } from "lucide-react";

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [form, setForm] = useState({ name: user?.name || "", designation: user?.designation || "" });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("designation", form.designation);
      if (fileRef.current.files[0]) fd.append("profilePhoto", fileRef.current.files[0]);
      const data = await updateMyProfileApi(fd);
      updateUser(data.user);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      fileRef.current.value = "";
      setMessage("Profile updated");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwMessage("");
    try {
      await changePasswordAuthApi(pwForm.currentPassword, pwForm.newPassword);
      setPwMessage("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password");
    }
  };

  const photoSrc = previewUrl || user?.profilePhoto;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card title="My Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-xl font-semibold text-accent-700">
                {photoSrc ? (
                  <img src={photoSrc} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                title="Change photo"
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-600 text-white"
              >
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            </div>
            <div>
              <p className="font-medium text-slate-700">{user?.email}</p>
              <p className="text-sm capitalize text-slate-400">{user?.role?.replace("_", " ")}</p>
              {previewUrl && <p className="text-xs text-accent-600">New photo selected — click "Save changes" to upload</p>}
            </div>
          </div>

          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
            <p>
              <span className="block text-xs text-slate-400">Department</span>
              {user?.department?.name || "—"}
            </p>
            <p>
              <span className="block text-xs text-slate-400">Joining Date</span>
              {user?.joiningDate ? formatDate(user.joiningDate) : "—"}
            </p>
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>

      <Card title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={6}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
          />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwMessage && <p className="text-sm text-emerald-600">{pwMessage}</p>}
          <Button type="submit">Update password</Button>
        </form>
      </Card>
    </div>
  );
}
