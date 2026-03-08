import { useState } from "react";
import api from "../services/api.js";

export default function AmbulanceRequestPage() {
  const [form, setForm] = useState({
    type: "ambulance",
    severity: 2,
    emergencyDescription: "",
    lat: "",
    lng: ""
  });
  const [status, setStatus] = useState(null);

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
      const res = await api.post("/requests", {
        type: form.type,
        severity: Number(form.severity),
        emergencyDescription: form.emergencyDescription,
        location
      });
      setStatus(`Request submitted. ID: ${res.data._id}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit request. Check console.");
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Ambulance Request</h2>
        <p className="text-sm text-slate-400">
          A Gemini-powered analyzer will classify and prioritize your emergency.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Latitude</label>
            <input
              type="number"
              name="lat"
              step="0.0001"
              required
              value={form.lat}
              onChange={handleChange}
              className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Longitude</label>
            <input
              type="number"
              name="lng"
              step="0.0001"
              required
              value={form.lng}
              onChange={handleChange}
              className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">Severity (0 = normal, 4 = disaster)</label>
          <input
            type="number"
            name="severity"
            min="0"
            max="4"
            value={form.severity}
            onChange={handleChange}
            className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">Emergency description</label>
          <textarea
            name="emergencyDescription"
            rows="3"
            value={form.emergencyDescription}
            onChange={handleChange}
            className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs"
            placeholder="Example: I think a cyclone has hit our village, many people are injured and roads are flooded."
          />
        </div>
        <button
          type="submit"
          className="mt-2 inline-flex items-center px-4 py-1.5 rounded-md bg-primary text-xs font-medium text-white"
        >
          Submit Request
        </button>
        {status && <p className="text-xs text-slate-300 mt-2">{status}</p>}
      </form>
    </div>
  );
}

