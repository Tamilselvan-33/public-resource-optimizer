import { useEffect, useState } from "react";
import api from "../services/api.js";
import MapView from "../components/MapView.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";

export default function AdminDashboard() {
  const [villages, setVillages] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, rRes] = await Promise.all([api.get("/villages"), api.get("/requests")]);
        setVillages(
          vRes.data.map((v) => ({
            ...v,
            priorityScore:
              v.currentSituationSeverity && v.currentSituationSeverity > 0
                ? 0.3 + 0.1 * v.currentSituationSeverity
                : 0.2
          }))
        );
        setRequests(rRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Admin Dashboard</h2>
        <p className="text-sm text-slate-400">
          Monitor active requests, village priorities, and dispatch resources.
        </p>
      </div>

      <MapView villages={villages} ambulances={[]} disasters={[]} />

      <div className="border border-slate-800 rounded-xl bg-slate-900/60">
        <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-100">Active Requests</h3>
          <span className="text-xs text-slate-400">{requests.length} requests</span>
        </div>
        <div className="divide-y divide-slate-800">
          {requests.map((r) => (
            <div key={r._id} className="px-4 py-2 flex items-center justify-between text-xs">
              <div>
                <div className="font-medium text-slate-100">
                  {r.type.toUpperCase()} request – severity {r.severity}
                </div>
                <div className="text-slate-400">
                  {r.userId?.name} ({r.userId?.phone})
                </div>
              </div>
              <div className="flex items-center gap-3">
                {typeof r.priorityScore === "number" && <PriorityBadge score={r.priorityScore} />}
                <span className="text-slate-400 capitalize">{r.status}</span>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="px-4 py-4 text-xs text-slate-400">No active requests.</div>
          )}
        </div>
      </div>
    </div>
  );
}

