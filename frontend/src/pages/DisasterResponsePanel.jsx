import { useState } from "react";
import api from "../services/api.js";
import AIInsightsPanel from "../components/AIInsightsPanel.jsx";

export default function DisasterResponsePanel() {
  const [form, setForm] = useState({
    type: "flood",
    severity: 3,
    lat: "",
    lng: "",
    description: ""
  });
  const [aiInsights, setAiInsights] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const location = {
        type: "Point",
        coordinates: [parseFloat(form.lng), parseFloat(form.lat)]
      };
      const res = await api.post("/disaster", {
        type: form.type,
        severity: Number(form.severity),
        location,
        description: form.description
      });
      setAiInsights(res.data.aiAnalysis);
    } catch (err) {
      console.error("Failed to create disaster event", err);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div className="md:col-span-2 space-y-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Disaster Response</h2>
          <p className="text-sm text-slate-400">
            Use Gemini to summarize disaster reports and estimate required resources.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
              >
                <option value="flood">Flood</option>
                <option value="earthquake">Earthquake</option>
                <option value="cyclone">Cyclone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Severity (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Report / description</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
              placeholder="Paste news reports or official alerts here..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-1.5 rounded-md bg-primary text-xs font-medium text-white"
          >
            Analyze Disaster
          </button>
        </form>
      </div>

      <AIInsightsPanel title="Disaster Intelligence" insights={aiInsights} />
    </div>
  );
}

