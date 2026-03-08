export default function AIInsightsPanel({ title = "AI Insights", insights }) {
  if (!insights) {
    return (
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-xs text-slate-400">
          No AI insights yet. Trigger an analysis from the disaster or allocation panels.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
      <h3 className="text-sm font-semibold text-slate-100 mb-2">{title}</h3>
      {insights.summary && (
        <p className="text-xs text-slate-300 mb-2 whitespace-pre-line">{insights.summary}</p>
      )}
      {insights.recommendations && (
        <p className="text-xs text-slate-300 mb-2 whitespace-pre-line">
          {insights.recommendations}
        </p>
      )}
      {Array.isArray(insights.warnings) && insights.warnings.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-semibold text-amber-400">Warnings</div>
          <ul className="mt-1 text-xs text-amber-300 list-disc list-inside space-y-0.5">
            {insights.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

