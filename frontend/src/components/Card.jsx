export default function Card({ title, description, children, actions }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl shadow-sm">
      {(title || description || actions) && (
        <div className="px-4 py-3 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-100">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

