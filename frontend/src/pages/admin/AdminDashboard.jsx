import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../services/api.js";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalRequests: 0,
    activeDisasters: 0,
    availableAmbulances: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, disRes, ambRes] = await Promise.all([
          api.get("/requests"),
          api.get("/disaster"),
          api.get("/ambulances")
        ]);
        setSummary({
          totalRequests: reqRes.data.length,
          activeDisasters: disRes.data.length,
          availableAmbulances: ambRes.data.filter((a) => a.status === "available").length
        });
        setRecentRequests(reqRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      }
    };
    load();
  }, []);

  const requestColumns = [
    { header: "Type", accessor: "type" },
    { header: "Severity", accessor: "severity" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 text-[11px] capitalize">
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Admin Dashboard</h1>
      <p className="text-xs text-slate-400">
        Overview of system activity, emergencies, and available resources across villages.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Total Requests">
          <div className="text-2xl font-semibold text-slate-50">{summary.totalRequests}</div>
        </Card>
        <Card title="Active Disaster Events">
          <div className="text-2xl font-semibold text-slate-50">{summary.activeDisasters}</div>
        </Card>
        <Card title="Available Ambulances">
          <div className="text-2xl font-semibold text-slate-50">
            {summary.availableAmbulances}
          </div>
        </Card>
      </div>

      <Card title="Recent Requests" description="Most recent emergency and disaster requests.">
        <Table
          columns={requestColumns}
          data={recentRequests}
          emptyMessage="No recent requests found."
        />
      </Card>
    </div>
  );
}

