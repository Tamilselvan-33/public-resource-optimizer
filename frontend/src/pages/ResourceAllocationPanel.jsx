import { useEffect, useState } from "react";
import api from "../services/api.js";
import AIInsightsPanel from "../components/AIInsightsPanel.jsx";

export default function ResourceAllocationPanel() {
  const [requests, setRequests] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [result, setResult] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, aRes] = await Promise.all([
          api.get("/requests"),
          api.get("/ambulances")
        ]);
        setRequests(rRes.data);
        setAmbulances(aRes.data);
      } catch (err) {
        console.error("Failed to load resources", err);
      }
    };
    load();
  }, []);

  const runOptimization = async () => {
    try {
      const res = await api.post("/requests/optimize");
      setResult(res.data);

      const advisory = await api.post("/ai/allocation-advisor", {
        villages: res.data.requestsRanked?.map((r) => r.village) || []
      });
      setAiInsights(advisory.data);
    } catch (err) {
      console.error("Optimization failed", err);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">Resource Allocation</h2>
            <p className="text-sm text-slate-400">
              Rank requests by priority score and simulate ambulance dispatch.
            </p>
          </div>
          <button
            onClick={runOptimization}
            className="px-4 py-1.5 rounded-md bg-primary text-xs font-medium text-white"
          >
            Run Optimization
          </button>
        </div>

        <div className="border border-slate-800 rounded-xl bg-slate-900/60">
          <div className="px-4 py-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100">Current Resources</h3>
          </div>
          <div className="p-3 text-xs text-slate-300">
            <div>Active requests: {requests.length}</div>
            <div>Available ambulances: {ambulances.filter((a) => a.status === "available").length}</div>
          </div>
        </div>

        {result && (
          <div className="border border-slate-800 rounded-xl bg-slate-900/60">
            <div className="px-4 py-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">AI Engine Suggestions</h3>
            </div>
            <div className="p-3 text-xs text-slate-300 space-y-3">
              <div>
                <div className="font-semibold mb-1">Assignments</div>
                {result.assignments.map((a) => (
                  <div key={a.requestId} className="flex justify-between">
                    <span>Request {a.requestId}</span>
                    <span>
                      Ambulance {a.ambulanceId} – score {a.priorityScore.toFixed(2)}
                    </span>
                  </div>
                ))}
                {result.assignments.length === 0 && <div>No assignments suggested.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <AIInsightsPanel title="AI Allocation Advisor" insights={aiInsights} />
    </div>
  );
}

