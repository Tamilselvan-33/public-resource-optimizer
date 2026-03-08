import { useEffect, useState } from "react";
import api from "../services/api.js";
import MapView from "../components/MapView.jsx";

export default function MapTrackingPage() {
  const [villages, setVillages] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, aRes, dRes] = await Promise.all([
          api.get("/villages"),
          api.get("/ambulances"),
          api.get("/disaster")
        ]);
        setVillages(vRes.data);
        setAmbulances(aRes.data);
        setDisasters(dRes.data);
      } catch (err) {
        console.error("Failed to load map data", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Live Map Dashboard</h2>
        <p className="text-sm text-slate-400">
          View ambulances, disaster zones, and village priority heatmap.
        </p>
      </div>
      <MapView villages={villages} ambulances={ambulances} disasters={disasters} />
    </div>
  );
}

