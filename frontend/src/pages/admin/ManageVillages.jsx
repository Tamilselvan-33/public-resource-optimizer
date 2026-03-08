import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../services/api.js";

export default function ManageVillages() {
  const [villages, setVillages] = useState([]);
  const [form, setForm] = useState({
    name: "",
    population: "",
    elderlyPopulation: "",
    nearestHospitalDistance: "",
    vulnerabilityIndex: ""
  });

  const loadVillages = async () => {
    try {
      const res = await api.get("/villages");
      setVillages(res.data || []);
    } catch (err) {
      console.error("Failed to load villages", err);
    }
  };

  useEffect(() => {
    loadVillages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/villages", {
        name: form.name,
        population: Number(form.population),
        elderlyPopulation: Number(form.elderlyPopulation),
        nearestHospitalDistance: Number(form.nearestHospitalDistance),
        vulnerabilityIndex: Number(form.vulnerabilityIndex),
        location: {
          type: "Point",
          coordinates: [77.5, 13.0]
        }
      });
      setForm({
        name: "",
        population: "",
        elderlyPopulation: "",
        nearestHospitalDistance: "",
        vulnerabilityIndex: ""
      });
      loadVillages();
    } catch (err) {
      console.error("Failed to create village", err);
    }
  };

  const columns = [
    { header: "Village", accessor: "name" },
    { header: "Population", accessor: "population" },
    { header: "Elderly", accessor: "elderlyPopulation" },
    { header: "Distance to Hospital (km)", accessor: "nearestHospitalDistance" },
    { header: "Vulnerability", accessor: "vulnerabilityIndex" }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Manage Villages</h1>
      <p className="text-xs text-slate-400">
        Maintain village-level data used by the AI priority scoring engine.
      </p>

      <Card title="Add Village">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Village Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Population</label>
            <input
              type="number"
              name="population"
              value={form.population}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Elderly Population</label>
            <input
              type="number"
              name="elderlyPopulation"
              value={form.elderlyPopulation}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Distance to Hospital (km)</label>
            <input
              type="number"
              name="nearestHospitalDistance"
              value={form.nearestHospitalDistance}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Vulnerability Index (0–1)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              name="vulnerabilityIndex"
              value={form.vulnerabilityIndex}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-500"
            >
              Add Village
            </button>
          </div>
        </form>
      </Card>

      <Card title="Villages">
        <Table
          columns={columns}
          data={villages}
          emptyMessage="No villages configured yet. Add one above."
        />
      </Card>
    </div>
  );
}

