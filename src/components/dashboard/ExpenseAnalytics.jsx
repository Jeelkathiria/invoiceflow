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
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Check,
  Eye,
} from 'lucide-react'
import { calculateMultiCurrencyTotals, formatCurrency } from '../../utils/formatCurrency'

export function ExpenseAnalytics({ liveInvoices = [] }) {
  const [chartType, setChartType] = useState('area') // 'area' | 'bar' | 'category' | 'paid'
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

  // Filter successfully paid invoices
  const paidInvoicesList = useMemo(() => {
    if (!Array.isArray(liveInvoices)) return []
    return liveInvoices.filter((inv) => inv.status === 'PAID' || inv.status === 'Paid')
  }, [liveInvoices])

  const paidTotalInr = useMemo(() => {
    return paidInvoicesList.reduce((acc, inv) => {
      const rawAmt = Number(inv.amount || inv.totalAmount || 0) || 0
      const curr = (inv.currency || 'INR').toUpperCase()
      return acc + (curr === 'USD' || curr === '$' ? rawAmt * 83.5 : rawAmt)
    }, 0)
  }, [paidInvoicesList])

  // Monthly aggregated data from live invoices
  const chartData = useMemo(() => {
    const monthsMap = {
      Jan: { month: 'Jan', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Feb: { month: 'Feb', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Mar: { month: 'Mar', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Apr: { month: 'Apr', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      May: { month: 'May', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Jun: { month: 'Jun', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Jul: { month: 'Jul', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
      Aug: { month: 'Aug', amount: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    }

    if (Array.isArray(liveInvoices) && liveInvoices.length > 0) {
      liveInvoices.forEach((inv) => {
        const rawAmt = Number(inv.amount || inv.totalAmount || 0) || 0
        const curr = (inv.currency || 'INR').toUpperCase()
        const inrAmt = curr === 'USD' || curr === '$' ? rawAmt * 83.5 : rawAmt

        const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
        const monthKey = d.toLocaleString('en-US', { month: 'short' })
        const target = monthsMap[monthKey] || monthsMap.Aug

        target.amount += inrAmt
        target.count += 1

        const isPaid = inv.status === 'PAID' || inv.status === 'Paid'
        const isApproved = inv.status === 'Approved' || inv.status === 'Accepted' || inv.status === 'PAYMENT_QUEUE'

        if (isPaid) {
          target.paid += inrAmt
        } else if (isApproved) {
          target.approved += inrAmt
        } else {
          target.pending += inrAmt
        }
      })
    }

    return Object.values(monthsMap).map((m) => ({
      ...m,
      displayAmount: Math.round(m.amount * rate),
      displayPaid: Math.round(m.paid * rate),
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

    const SHADCN_COLORS = ['#10b981', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

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
  const paidPercentage = useMemo(
    () => (totalVolumeInr > 0 ? Math.round((paidTotalInr / totalVolumeInr) * 100) : (paidTotalInr > 0 ? 100 : 0)),
    [totalVolumeInr, paidTotalInr]
  )

  const multiCurrencySummary = useMemo(() => {
    return calculateMultiCurrencyTotals(liveInvoices)
  }, [liveInvoices])

  // Custom Tooltip Popover
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2 min-w-[180px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{data.month} 2026</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              {data.count} Invoices
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Volume:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {formatAmt(data.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-600 font-bold">
              <span>Paid (Disbursed):</span>
              <span>{formatAmt(data.paid)}</span>
            </div>
            <div className="flex items-center justify-between text-indigo-600">
              <span>Payment Queue:</span>
              <span className="font-semibold">{formatAmt(data.approved)}</span>
            </div>
            <div className="flex items-center justify-between text-amber-600">
              <span>Pending Review:</span>
              <span className="font-semibold">{formatAmt(data.pending)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shadcn Financial Analytics
            </span>
          </div>
          <h3 className="mt-1 text-xl font-black text-slate-900 tracking-tight">
            Invoice Volume & Spend Dynamics
          </h3>
        </div>

        {/* Action Controls: Currency Switcher & View Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Toggle (INR vs USD) */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            <button
              onClick={() => setSelectedCurrency('INR')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                selectedCurrency === 'INR'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="h-3.5 w-3.5" />
              <span>INR (₹)</span>
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                selectedCurrency === 'USD'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>USD ($)</span>
            </button>
          </div>

          {/* Chart Type Segment Pills */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'area'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bars</span>
            </button>
            <button
              onClick={() => setChartType('category')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'category'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              <span>Category</span>
            </button>
            <button
              onClick={() => setChartType('paid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition ${
                chartType === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Paid Invoices ({paidInvoicesList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
          <p className="mt-0.5 text-lg font-black text-slate-900">
            {formatAmt(totalVolumeInr)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
            {totalCount} Total Invoices
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
              Successfully Paid
            </span>
            <span className="rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-900">
              {paidPercentage}%
            </span>
          </div>
          <p className="mt-0.5 text-lg font-black text-emerald-700">
            {formatAmt(paidTotalInr)}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
            {paidInvoicesList.length} Invoices Settled
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Invoice</span>
          <p className="mt-0.5 text-lg font-black text-blue-600">
            {formatAmt(totalCount > 0 ? totalVolumeInr / totalCount : 0)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{totalCount} total invoices</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            AI Extraction Engine
          </span>
          <p className="mt-0.5 text-lg font-black text-slate-900">1.2 sec</p>
          <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
            <Sparkles className="h-3 w-3" /> Gemini Vision 2.5
          </p>
        </div>
      </div>

      {/* Main Chart & Table Display Area */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        {/* 1. AREA CHART VIEW */}
        {chartType === 'area' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Spline Monthly Volume Trend ({selectedCurrency})</span>
              <span className="text-[11px] font-bold text-blue-600">
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
              <span className="text-[11px] font-bold text-emerald-600">
                Paid vs Queue vs Pending Breakdown
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
                  <Bar dataKey="displayPaid" name="Paid (Disbursed)" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="displayApproved" name="Payment Queue" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="displayPending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. CATEGORY PIE VIEW */}
        {chartType === 'category' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>Category Distribution & Spend Breakdown ({selectedCurrency})</span>
              <span className="text-[11px] font-bold text-blue-600">
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
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="font-mono font-bold text-slate-600">
                          {currencySymbol}{cat.value.toLocaleString()} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
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

        {/* 4. SUCCESSFULLY PAID INVOICES LIST VIEW */}
        {chartType === 'paid' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Successfully Paid Invoices ({paidInvoicesList.length})
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Total Disbursed: {formatAmt(paidTotalInr)}
              </span>
            </div>

            {paidInvoicesList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500 font-medium">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2 opacity-60" />
                No invoices marked as successfully paid yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Invoice & Vendor</th>
                      <th className="py-2.5 px-3.5">Category</th>
                      <th className="py-2.5 px-3.5">Settlement Date</th>
                      <th className="py-2.5 px-3.5 text-right">Amount</th>
                      <th className="py-2.5 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paidInvoicesList.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-blue-600">{inv.invoiceNumber || 'INV-001'}</span>
                          <p className="font-bold text-slate-900">{inv.vendorName || 'Vendor'}</p>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">{inv.category || 'General'}</td>
                        <td className="py-3 px-3.5 text-slate-700 font-semibold">
                          {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : inv.invoiceDate || 'Today'}
                        </td>
                        <td className="py-3 px-3.5 text-right font-black text-slate-900">
                          {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                            PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
