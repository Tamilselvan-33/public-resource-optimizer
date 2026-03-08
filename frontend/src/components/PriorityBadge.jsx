const COLORS = {
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  medium: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  high: "bg-orange-500/20 text-orange-200 border-orange-500/40",
  critical: "bg-red-500/20 text-red-200 border-red-500/40"
};

export default function PriorityBadge({ score }) {
  let level = "low";
  if (score >= 0.75) level = "critical";
  else if (score >= 0.5) level = "high";
  else if (score >= 0.3) level = "medium";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[level]}`}
    >
      {level.toUpperCase()} ({score.toFixed(2)})
    </span>
  );
}

