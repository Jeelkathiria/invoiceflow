import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Sparkles, PieChart, Activity } from 'lucide-react'

export function ExpenseAnalytics({ liveInvoices = [] }) {
  const [chartType, setChartType] = useState('area') // 'area' | 'bar' | 'category'
  const [timeframe, setTimeframe] = useState('YTD 2026')
  const [hoveredData, setHoveredData] = useState(null)

  // Compute live data strictly from liveInvoices (0 if empty)
  const chartData = useMemo(() => {
    const monthsMap = {
      Jan: { month: 'Jan', amount: 0, count: 0, approved: 0, pending: 0 },
      Feb: { month: 'Feb', amount: 0, count: 0, approved: 0, pending: 0 },
      Mar: { month: 'Mar', amount: 0, count: 0, approved: 0, pending: 0 },
      Apr: { month: 'Apr', amount: 0, count: 0, approved: 0, pending: 0 },
      May: { month: 'May', amount: 0, count: 0, approved: 0, pending: 0 },
      Jun: { month: 'Jun', amount: 0, count: 0, approved: 0, pending: 0 },
      Jul: { month: 'Jul', amount: 0, count: 0, approved: 0, pending: 0 },
      Aug: { month: 'Aug', amount: 0, count: 0, approved: 0, pending: 0 },
    }

    if (Array.isArray(liveInvoices) && liveInvoices.length > 0) {
      liveInvoices.forEach((inv) => {
        const amt = Number(inv.amount || inv.totalAmount || 0)
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
        const monthKey = d.toLocaleString('en-US', { month: 'short' })
        
        const targetMonth = monthsMap[monthKey] || monthsMap.Aug
        targetMonth.amount += amt
        targetMonth.count += 1
        if (inv.status === 'Approved') targetMonth.approved += amt
        else targetMonth.pending += amt
      })
    }

    return Object.values(monthsMap)
  }, [liveInvoices])

  const categoryBreakdown = useMemo(() => {
    if (!Array.isArray(liveInvoices) || liveInvoices.length === 0) return []

    const cats = {}
    let totalAmt = 0

    liveInvoices.forEach((inv) => {
      const cat = inv.category || 'General Expense'
      const amt = Number(inv.amount || inv.totalAmount || 0)
      cats[cat] = (cats[cat] || 0) + amt
      totalAmt += amt
    })

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    return Object.keys(cats).map((cat, idx) => ({
      category: cat,
      amount: cats[cat],
      color: colors[idx % colors.length],
      percentage: totalAmt > 0 ? Math.round((cats[cat] / totalAmt) * 100) : 0,
    }))
  }, [liveInvoices])

  const totalVolume = useMemo(() => chartData.reduce((acc, curr) => acc + curr.amount, 0), [chartData])
  const totalCount = useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData])
  const avgValue = useMemo(() => (totalCount > 0 ? Math.round(totalVolume / totalCount) : 0), [totalVolume, totalCount])

  const approvedTotal = useMemo(() => chartData.reduce((acc, curr) => acc + curr.approved, 0), [chartData])
  const approvedPercentage = useMemo(() => (totalVolume > 0 ? Math.round((approvedTotal / totalVolume) * 100) : 0), [totalVolume, approvedTotal])

  // SVG dimensions
  const maxAmount = useMemo(() => Math.max(...chartData.map((d) => d.amount)) * 1.15 || 1, [chartData])
  const svgWidth = 700
  const svgHeight = 200
  const paddingX = 40
  const paddingY = 20

  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2)
      const y = svgHeight - paddingY - (d.amount / maxAmount) * (svgHeight - paddingY * 2)
      return { x, y, ...d }
    })
  }, [chartData, maxAmount])

  // Smooth SVG Bezier Path
  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`
      const prev = a[i - 1]
      const cp1X = prev.x + (point.x - prev.x) / 2
      const cp1Y = prev.y
      const cp2X = prev.x + (point.x - prev.x) / 2
      const cp2Y = point.y
      return `${acc} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${point.x},${point.y}`
    }, '')
  }, [points])

  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return ''
    const firstX = points[0].x
    const lastX = points[points.length - 1].x
    const bottomY = svgHeight - paddingY
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`
  }, [linePath, points])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header Row & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
              <Activity className="h-4 w-4" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Analytics & Intelligence</p>
          </div>
          <h3 className="mt-1 text-xl font-black text-slate-900 tracking-tight">Invoice Volume & Spend Dynamics</h3>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs font-bold">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                chartType === 'area' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Trend Line</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                chartType === 'bar' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Monthly Bars</span>
            </button>
            <button
              onClick={() => setChartType('category')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                chartType === 'category' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="h-3.5 w-3.5" />
              <span>Category</span>
            </button>
          </div>

          {/* Timeframe selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none hover:bg-white transition cursor-pointer"
          >
            <option value="YTD 2026">YTD 2026</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Full Year 2026">Full Year 2026</option>
          </select>
        </div>
      </div>

      {/* Metric Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
          <p className="mt-0.5 text-lg font-black text-slate-900">₹{totalVolume.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="h-3 w-3" /> Live MongoDB data
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Invoice</span>
          <p className="mt-0.5 text-lg font-black text-blue-600">₹{avgValue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Across {totalCount} invoices</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved Cleared</span>
          <p className="mt-0.5 text-lg font-black text-emerald-600">{approvedPercentage}% Cleared</p>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">₹{approvedTotal.toLocaleString('en-IN')} approved</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-blue-50/60 border-blue-200 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">AI Extraction Speed</span>
          <p className="mt-0.5 text-lg font-black text-slate-900">1.2 seconds</p>
          <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
            <Sparkles className="h-3 w-3" /> Gemini 2.5 Engine
          </p>
        </div>
      </div>

      {/* Chart View Container */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-5 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        {/* 1. AREA / TREND LINE CHART */}
        {chartType === 'area' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] font-bold text-slate-300">Spline Trend Curve (INR Volume)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span> Total Volume
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Approved
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full h-56">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Horizontal Lines */}
                {[0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={paddingY + ratio * (svgHeight - paddingY * 2)}
                    x2={svgWidth - paddingX}
                    y2={paddingY + ratio * (svgHeight - paddingY * 2)}
                    stroke="#334155"
                    strokeDasharray="4 4"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Area Gradient Path */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Main Smooth Line Path */}
                <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="3.5" filter="url(#glow)" />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredData(pt)}>
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" />
                    <text x={pt.x} y={svgHeight - 2} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredData && (
                <div
                  style={{
                    left: `${(hoveredData.x / svgWidth) * 100}%`,
                    top: `${(hoveredData.y / svgHeight) * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-full mb-3 z-20 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-white text-xs space-y-1 min-w-[140px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-blue-400">{hoveredData.month} 2026</span>
                    <span className="text-[10px] text-slate-400 font-mono">{hoveredData.count} Invoices</span>
                  </div>
                  <p className="font-black text-sm text-white">₹{hoveredData.amount.toLocaleString('en-IN')}</p>
                  <div className="text-[10px] space-y-0.5 pt-1 border-t border-slate-800/80">
                    <p className="text-emerald-400 font-semibold">Approved: ₹{hoveredData.approved.toLocaleString('en-IN')}</p>
                    <p className="text-amber-400 font-semibold">Pending: ₹{hoveredData.pending.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MONTHLY BAR CHART VIEW */}
        {chartType === 'bar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] font-bold text-slate-300">Monthly Processing Breakdown (INR)</span>
              <span className="text-[10px] text-blue-400 font-bold">Hover bars to inspect breakdown</span>
            </div>

            <div className="flex h-52 items-end gap-3 px-2 sm:gap-6 pt-4">
              {chartData.map((item) => {
                const heightPct = item.amount > 0 ? Math.round((item.amount / maxAmount) * 100) : 4
                const approvedPct = item.amount > 0 ? Math.round((item.approved / item.amount) * 100) : 0
                return (
                  <div key={item.month} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                    <div className="relative w-full rounded-xl bg-slate-800/80 overflow-hidden h-full flex items-end border border-slate-700/50">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 transition-all duration-300 relative overflow-hidden"
                      >
                        {approvedPct > 0 && (
                          <div
                            style={{ height: `${approvedPct}%` }}
                            className="w-full bg-emerald-500/30 border-t border-emerald-400/50 absolute bottom-0 left-0"
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. CATEGORY DISTRIBUTION VIEW */}
        {chartType === 'category' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] font-bold text-slate-300">Category Distribution & Spend Breakdown</span>
              <span className="text-[10px] font-bold text-emerald-400">Live Database Sync</span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No categorical invoice spend recorded.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 items-center py-2">
                <div className="space-y-3">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          {cat.category}
                        </span>
                        <span className="font-mono font-bold text-slate-400">₹{cat.amount.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
