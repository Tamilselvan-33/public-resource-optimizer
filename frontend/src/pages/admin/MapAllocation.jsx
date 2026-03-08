import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import MapView from "../../components/MapView.jsx";
import api from "../../services/api.js";

export default function MapAllocation() {
  const [villages, setVillages] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, aRes, rRes] = await Promise.all([
          api.get("/villages"),
          api.get("/ambulances"),
          api.get("/requests")
        ]);
        setVillages(vRes.data || []);
        setAmbulances(aRes.data || []);
        setRequests(rRes.data || []);
      } catch (err) {
        console.error("Failed to load map allocation data", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Resource Allocation Map</h1>
      <p className="text-xs text-slate-400">
        Visualize villages, ambulances, and active requests. Colors represent priority levels
        calculated by the AI engine.
      </p>

      <Card>
        <MapView villages={villages} ambulances={ambulances} disasters={[]} />
      </Card>

      <Card title="Active Requests">
        <ul className="space-y-1 text-xs text-slate-300 max-h-40 overflow-y-auto">
          {requests.map((r) => (
            <li key={r._id} className="flex justify-between">
              <span className="capitalize">{r.type}</span>
              <span className="text-slate-400">
                Severity {r.severity} · {r.status}
              </span>
            </li>
          ))}
          {requests.length === 0 && (
            <li className="text-slate-500">No active requests at the moment.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}

