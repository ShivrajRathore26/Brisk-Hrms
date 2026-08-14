import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../api/auth.api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-slate-800">Reset your password</h1>
        <p className="mb-6 text-sm text-slate-400">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            If that email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-accent-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
