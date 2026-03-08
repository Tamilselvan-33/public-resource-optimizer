import { Link } from "react-router-dom";
import CitizenChatBot from "../components/CitizenChatBot.jsx";

export default function CitizenDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Citizen Dashboard</h2>
        <p className="text-sm text-slate-400">
          Request ambulances, track status, and get AI-powered safety guidance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Request an Ambulance</h3>
          <p className="text-xs text-slate-400 mb-3">
            Provide your location, emergency type, and a short description.
          </p>
          <Link
            to="/request"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-xs font-medium"
          >
            Open Request Form
          </Link>
        </div>

        <div className="md:col-span-2">
          <CitizenChatBot />
        </div>
      </div>
    </div>
  );
}

