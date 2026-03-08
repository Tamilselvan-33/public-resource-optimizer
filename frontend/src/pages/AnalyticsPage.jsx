import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import api from "../services/api.js";

export default function AnalyticsPage() {
  const [requestSeries, setRequestSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/requests");
        const grouped = res.data.reduce((acc, r) => {
          const day = new Date(r.createdAt).toISOString().slice(0, 10);
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});
        const series = Object.entries(grouped).map(([date, count]) => ({
          date,
          count
        }));
        setRequestSeries(series);
      } catch (err) {
        console.error("Analytics load failed", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">Analytics & Insights</h2>
        <p className="text-sm text-slate-400">
          Track emergency volumes and patterns over time.
        </p>
      </div>

      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Requests Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={requestSeries}>
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorReq)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

