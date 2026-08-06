import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
  DollarSign,
  IndianRupee,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { calculateMultiCurrencyTotals, formatCurrency } from '../../utils/formatCurrency'

export function ExpenseAnalytics({ liveInvoices = [] }) {
  const [chartType, setChartType] = useState('area') // 'area' | 'bar' | 'category'
  const [selectedCurrency, setSelectedCurrency] = useState('INR') // 'INR' | 'USD'
  const [timeframe, setTimeframe] = useState('YTD 2026')

  // Exchange multiplier
  const isUSD = selectedCurrency === 'USD'
  const rate = isUSD ? 1 / 83.5 : 1
  const currencySymbol = isUSD ? '$' : '₹'

  // Format helper for numbers inside chart
  const formatAmt = (amt) => {
    const val = Math.round(amt * rate)
    return `${currencySymbol}${val.toLocaleString(isUSD ? 'en-US' : 'en-IN')}`
  }

  // Monthly aggregated data from live invoices
  const chartData = useMemo(() => {
    const monthsMap = {
      Jan: { month: 'Jan', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Feb: { month: 'Feb', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Mar: { month: 'Mar', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Apr: { month: 'Apr', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      May: { month: 'May', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Jun: { month: 'Jun', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Jul: { month: 'Jul', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
      Aug: { month: 'Aug', amount: 0, count: 0, approved: 0, pending: 0, usdAmount: 0 },
    }

    if (Array.isArray(liveInvoices) && liveInvoices.length > 0) {
      liveInvoices.forEach((inv) => {
        const rawAmt = Number(inv.amount || inv.totalAmount || 0) || 0
        const curr = (inv.currency || 'INR').toUpperCase()
        
        // Convert to base INR first
        const inrAmt = curr === 'USD' || curr === '$' ? rawAmt * 83.5 : rawAmt

        const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
        const monthKey = d.toLocaleString('en-US', { month: 'short' })

        const target = monthsMap[monthKey] || monthsMap.Aug
        target.amount += inrAmt
        target.count += 1
        if (inv.status === 'Approved') target.approved += inrAmt
        else target.pending += inrAmt
      })
    }

    return Object.values(monthsMap).map((m) => ({
      ...m,
      displayAmount: Math.round(m.amount * rate),
      displayApproved: Math.round(m.approved * rate),
      displayPending: Math.round(m.pending * rate),
    }))
  }, [liveInvoices, rate])

  // Category Breakdown Data
  const categoryData = useMemo(() => {
    if (!Array.isArray(liveInvoices) || liveInvoices.length === 0) return []

    const cats = {}
    let totalAmt = 0

    liveInvoices.forEach((inv) => {
      const cat = inv.category || 'General Expense'
      const rawAmt = Number(inv.amount || inv.totalAmount || 0) || 0
      const curr = (inv.currency || 'INR').toUpperCase()
      const inrAmt = curr === 'USD' || curr === '$' ? rawAmt * 83.5 : rawAmt

      cats[cat] = (cats[cat] || 0) + inrAmt
      totalAmt += inrAmt
    })

    const SHADCN_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

    return Object.keys(cats).map((cat, idx) => {
      const inrVal = cats[cat]
      const displayVal = Math.round(inrVal * rate)
      const pct = totalAmt > 0 ? Math.round((inrVal / totalAmt) * 100) : 0
      return {
        name: cat,
        value: displayVal,
        inrValue: inrVal,
        color: SHADCN_COLORS[idx % SHADCN_COLORS.length],
        percentage: pct,
      }
    })
  }, [liveInvoices, rate])

  // Summary Metrics
  const totalVolumeInr = useMemo(() => chartData.reduce((acc, curr) => acc + curr.amount, 0), [chartData])
  const totalCount = useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData])
  const approvedTotalInr = useMemo(() => chartData.reduce((acc, curr) => acc + curr.approved, 0), [chartData])
  const approvedPercentage = useMemo(
    () => (totalVolumeInr > 0 ? Math.round((approvedTotalInr / totalVolumeInr) * 100) : 0),
    [totalVolumeInr, approvedTotalInr]
  )

  const multiCurrencySummary = useMemo(() => {
    return calculateMultiCurrencyTotals(liveInvoices)
  }, [liveInvoices])

  // Custom Shadcn Style Tooltip Popover
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{data.month} 2026</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              {data.count} Invoices
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Spend:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {formatAmt(data.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-600">
              <span className="font-medium">Approved:</span>
              <span className="font-bold">{formatAmt(data.approved)}</span>
            </div>
            <div className="flex items-center justify-between text-amber-600">
              <span className="font-medium">Pending:</span>
              <span className="font-bold">{formatAmt(data.pending)}</span>
            </div>
          </div>

          {/* Dual Currency Reference */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-medium flex justify-between">
            <span>Alt Currency:</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {isUSD ? `₹${Math.round(data.amount).toLocaleString('en-IN')}` : `$${Math.round(data.amount / 83.5).toLocaleString('en-US')}`}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shadcn Financial Analytics
            </span>
          </div>
          <h3 className="mt-1 text-xl font-black text-slate-900 tracking-tight dark:text-slate-100">
            Invoice Volume & Spend Dynamics
          </h3>
        </div>

        {/* Action Controls: Currency Switcher & View Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Toggle (INR vs USD) */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setSelectedCurrency('INR')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                selectedCurrency === 'INR'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <IndianRupee className="h-3.5 w-3.5" />
              <span>INR (₹)</span>
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                selectedCurrency === 'USD'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>USD ($)</span>
            </button>
          </div>

          {/* Chart Type Segment Pills */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'area'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bars</span>
            </button>
            <button
              onClick={() => setChartType('category')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'category'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              <span>Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spend</span>
          <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
            {formatAmt(totalVolumeInr)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
            Breakdown: {multiCurrencySummary.formattedDual}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Invoice</span>
          <p className="mt-0.5 text-lg font-black text-blue-600 dark:text-blue-400">
            {formatAmt(totalCount > 0 ? totalVolumeInr / totalCount : 0)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{totalCount} total invoices</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved Cleared</span>
          <p className="mt-0.5 text-lg font-black text-emerald-600 dark:text-emerald-400">
            {approvedPercentage}%
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {formatAmt(approvedTotalInr)} approved
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            AI Engine Speed
          </span>
          <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">1.2 sec</p>
          <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5 dark:text-blue-400">
            <Sparkles className="h-3 w-3" /> Gemini Vision 2.5
          </p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        {/* 1. AREA CHART VIEW */}
        {chartType === 'area' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Spline Monthly Volume Trend ({selectedCurrency})</span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Live MongoDB Sync
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="displayAmount"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. BAR CHART VIEW */}
        {chartType === 'bar' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Monthly Spend Comparison ({selectedCurrency})</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Approved vs Pending Breakdown
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="displayApproved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="displayPending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. CATEGORY PIE & BREAKDOWN VIEW */}
        {chartType === 'category' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Category Distribution & Spend Breakdown ({selectedCurrency})</span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {categoryData.length} Categories
              </span>
            </div>

            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No categorical invoice spend recorded.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 items-center py-2">
                {/* Donut Chart */}
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`, 'Spend']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Bars Breakdown */}
                <div className="space-y-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                          {currencySymbol}{cat.value.toLocaleString()} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
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
