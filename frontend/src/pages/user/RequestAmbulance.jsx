import { useState } from "react";
import Card from "../../components/Card.jsx";
import api from "../../services/api.js";

export default function RequestAmbulance() {
  const [form, setForm] = useState({
    patientName: "",
    description: "",
    severity: 2,
    lat: "",
    lng: "",
    phone: ""
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
      const res = await api.post("/requests", {
        type: "ambulance",
        severity: Number(form.severity),
        emergencyDescription: `${form.patientName} – ${form.description} (phone: ${form.phone})`,
        location
      });
      setStatus(`Request submitted. ID: ${res.data._id}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl">
      <Card
        title="Ambulance Request"
        description="Provide key details so the system can prioritize and dispatch the nearest ambulance."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Emergency Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe what is happening, number of injured, road conditions, etc."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">
                Severity Level <span className="text-slate-500">(0–4)</span>
              </label>
              <input
                type="number"
                name="severity"
                min="0"
                max="4"
                value={form.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-300">Latitude</label>
              <input
                type="number"
                name="lat"
                step="0.0001"
                value={form.lat}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Map-based selection can be integrated here in the future. For now, please enter
            approximate GPS coordinates.
          </p>

          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500"
          >
            Submit Request
          </button>

          {status && <p className="mt-2 text-xs text-slate-300">{status}</p>}
        </form>
      </Card>
    </div>
  );
}

