export function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count })

  if (type === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((_, index) => (
          <div key={index} className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60 p-6 light:border-slate-200 light:bg-slate-100">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-slate-800 light:bg-slate-200"></div>
              <div className="h-4 w-12 rounded-full bg-slate-800 light:bg-slate-200"></div>
            </div>
            <div className="mt-4 h-3 w-24 rounded bg-slate-800 light:bg-slate-200"></div>
            <div className="mt-2 h-7 w-32 rounded bg-slate-800 light:bg-slate-200"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {items.map((_, index) => (
          <div key={index} className="h-14 rounded-2xl border border-slate-800 bg-slate-900/60 light:border-slate-200 light:bg-slate-100"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60 p-8 h-64 light:border-slate-200 light:bg-slate-100"></div>
  )
}
