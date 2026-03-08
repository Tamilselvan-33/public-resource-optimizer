import { Link } from "react-router-dom";
import CitizenChatBot from "../components/CitizenChatBot.jsx";

export default function LandingPage() {
  return (
    <div className="py-10 space-y-10">
      <div className="max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
          AI-Powered Public Resource Allocation & Optimization Engine
        </h1>
        <p className="mt-4 text-slate-300 text-sm md:text-base">
          Decision-support platform for ambulance dispatch, healthcare staff allocation, teacher
          distribution, and disaster relief in rural regions. Powered by a transparent priority
          scoring algorithm and Google Gemini insights.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/citizen"
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-500"
          >
            Citizen Portal
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm font-medium hover:bg-slate-700"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/map"
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 text-sm font-medium hover:border-primary"
          >
            Live Map
          </Link>
        </div>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Quick Help</h2>
        <p className="text-sm text-slate-400 mb-3">
          Ask the AI assistant anything about emergencies, ambulances, or disasters—no login required.
        </p>
        <CitizenChatBot />
      </div>
    </div>
  );
}

