export default function DonutChart({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let progress = 0;
  const gradient = segments
    .map((segment) => {
      const start = progress;
      const end = progress + (segment.value / total) * 100;
      progress = end;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-72 w-72 rounded-full bg-slate-100 p-6">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(var(--gradient))]" style={{ '--gradient': gradient }} />
        <div className="absolute inset-6 rounded-full bg-slate-50" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Invoice mix</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{total}</p>
          <p className="mt-2 text-sm text-slate-500">total invoices</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <div>
              <p className="font-semibold text-slate-900">{segment.label}</p>
              <p className="text-xs text-slate-500">{segment.value} invoices</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
