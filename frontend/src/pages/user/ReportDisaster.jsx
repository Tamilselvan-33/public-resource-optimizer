import { useState } from "react";
import Card from "../../components/Card.jsx";
import api from "../../services/api.js";

export default function ReportDisaster() {
  const [form, setForm] = useState({
    type: "flood",
    description: "",
    lat: "",
    lng: "",
    severity: 3
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      const location = {
        type: "Point",
        coordinates: [parseFloat(form.lng), parseFloat(form.lat)]
      };
      await api.post("/disaster", {
        type: form.type,
        severity: Number(form.severity),
        description: form.description,
        location
      });
      setStatus("Disaster report submitted to authorities.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit disaster report. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl">
      <Card
        title="Report a Disaster"
        description="Notify local authorities and the AI allocation engine about disasters affecting your village."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Disaster Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="flood">Flood</option>
                <option value="earthquake">Earthquake</option>
                <option value="cyclone">Cyclone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">
                Severity <span className="text-slate-500">(1–5)</span>
              </label>
              <input
                type="number"
                name="severity"
                min="1"
                max="5"
                value={form.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Describe the situation: water levels, damage, blocked roads, affected families..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Latitude</label>
              <input
                type="number"
                name="lat"
                step="0.0001"
                value={form.lat}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Longitude</label>
              <input
                type="number"
                name="lng"
                step="0.0001"
                value={form.lng}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Submit Report
          </button>

          {status && <p className="mt-2 text-xs text-slate-300">{status}</p>}
        </form>
      </Card>
    </div>
  );
}

