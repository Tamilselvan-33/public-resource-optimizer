import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import Card from "../components/Card.jsx";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend expects "phone"; we treat this as email/phone for now.
      const { data } = await api.post("/login", {
        phone: emailOrPhone,
        password
      });

      // Optional: ensure selected role is consistent with actual role.
      const desiredRole = role === "admin" ? "admin" : "citizen";
      if (data.user.role !== desiredRole) {
        setError("Role does not match this account. Please check your role selection.");
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      const redirectTo =
        location.state?.from?.pathname ||
        (data.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <Card
          title="Welcome back"
          description="Sign in to access the AI-powered public resource allocation platform."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Email or Phone</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com or 9990000001"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Create account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

