import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../services/api.js";

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      const res = await api.get("/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const columns = [
    { header: "Type", accessor: "type" },
    { header: "User", accessor: "userId", render: (val) => val?.name || "—" },
    { header: "Severity", accessor: "severity" },
    { header: "Status", accessor: "status" },
    {
      header: "Assigned Resource",
      accessor: "assignedResource",
      render: (v) => v || <span className="text-slate-500 text-[11px]">Unassigned</span>
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (_, row) => (
        <div className="flex gap-2 text-[11px]">
          <button className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700">
            Approve
          </button>
          <button className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600">
            Allocate
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Manage Requests</h1>
      <p className="text-xs text-slate-400">
        Review ambulance and disaster requests and approve or allocate resources.
      </p>
      <Card>
        <Table
          columns={columns}
          data={requests}
          emptyMessage="No requests found. They will appear here as citizens submit them."
        />
      </Card>
    </div>
  );
}

