import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../services/api.js";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // NOTE: Backend currently exposes /requests for admins.
        // In a production system you'd have a /requests/my endpoint.
        const res = await api.get("/requests");
        setRequests(res.data || []);
      } catch (err) {
        console.error("Failed to load requests", err);
        setRequests([]);
      }
    };
    load();
  }, []);

  const columns = [
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
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleString() : <span className="text-slate-500">–</span>
    }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">My Requests</h1>
      <p className="text-xs text-slate-400">
        This table lists recent requests visible to your account. In a full system, this would be
        filtered to only your submissions.
      </p>
      <Card>
        <Table columns={columns} data={requests} emptyMessage="No requests found." />
      </Card>
    </div>
  );
}

