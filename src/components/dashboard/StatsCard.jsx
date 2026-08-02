export default function StatsCard({ title, value, trend, icon: Icon, variant = 'bg-brand-500/10 text-brand-700', className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-3xl px-3 py-3 ${variant}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {trend ? <p className="mt-4 text-sm text-slate-500">{trend}</p> : null}
    </div>
  );
}
