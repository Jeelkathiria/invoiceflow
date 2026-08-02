import { TrendingUp, TrendingDown } from 'lucide-react'

export function CardSummary({ title, value, change, trend = 'up', icon: Icon, color = 'blue', description }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>

        {change && (
          <div className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
            trend === 'up' 
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  )
}


