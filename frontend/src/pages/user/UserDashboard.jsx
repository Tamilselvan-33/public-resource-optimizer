import { Link } from "react-router-dom";
import Card from "../../components/Card.jsx";

export default function UserDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">User Dashboard</h1>
      <p className="text-xs text-slate-400">
        Request ambulances, report disasters, and track the status of your requests.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Request Ambulance"
          description="Submit an emergency ambulance request with location and severity."
          actions={
            <Link
              to="/request-ambulance"
              className="px-3 py-1.5 rounded-md bg-blue-600 text-xs font-medium text-white hover:bg-blue-500"
            >
              Open
            </Link>
          }
        >
          <p className="text-xs text-slate-300">
            Provide patient details, contact information, and precise location for fastest response.
          </p>
        </Card>

        <Card
          title="Report Disaster"
          description="Inform authorities about floods, earthquakes, or other disasters."
          actions={
            <Link
              to="/report-disaster"
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Report
            </Link>
          }
        >
          <p className="text-xs text-slate-300">
            Share what is happening on the ground so resources can be prioritized correctly.
          </p>
        </Card>

        <Card
          title="My Requests"
          description="View the status and details of your submitted requests."
          actions={
            <Link
              to="/my-requests"
              className="px-3 py-1.5 rounded-md bg-slate-800 text-xs font-medium text-slate-100 hover:bg-slate-700"
            >
              View
            </Link>
          }
        >
          <p className="text-xs text-slate-300">
            Track whether your requests are pending, assigned, or completed.
          </p>
        </Card>
      </div>
    </div>
  );
}

