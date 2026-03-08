import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../services/api.js";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // In a full implementation there would be /users endpoint.
    // For now this can be wired later; keeping UI ready.
    setUsers([]);
  }, []);

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Actions",
      accessor: "actions",
      render: () => (
        <div className="flex gap-2 text-[11px]">
          <button className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700">
            View
          </button>
          <button className="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-600">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Manage Users</h1>
      <p className="text-xs text-slate-400">
        View and manage users of the platform. Backend endpoints can be wired to this table.
      </p>
      <Card>
        <Table columns={columns} data={users} emptyMessage="User management API not wired yet." />
      </Card>
    </div>
  );
}

