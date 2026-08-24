import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  FileText,
  AlertTriangle,
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  Activity,
  Check,
  XCircle,
} from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export function ManagerDashboardView({
  user,
  stats = {},
  invoices = [],
  teamOverview = [],
  attentionInvoices = [],
  riskOverview = {},
  activityTimeline = [],
  onRefresh,
}) {
  const navigate = useNavigate()

  // State
  const [timeframe, setTimeframe] = useState('month')
  const [approvalAnalyticsTab, setApprovalAnalyticsTab] = useState('count') // 'count' | 'value'
  const [orgSpendingTab, setOrgSpendingTab] = useState('value') // 'count' | 'value'
  const [selectedExecutive, setSelectedExecutive] = useState(null)

  // Combine activityTimeline with fallback generated activities to guarantee at least 3 recent activities for Manager
  const effectiveActivities = useMemo(() => {
    let list = Array.isArray(activityTimeline) ? [...activityTimeline] : []

    if (list.length < 3 && Array.isArray(invoices) && invoices.length > 0) {
      const fallbackItems = invoices.slice(0, 6).map((inv, idx) => {
        const invNo = inv.invoiceNumber || `INV-${String(idx + 1).padStart(3, '0')}`
        const vendor = inv.vendorName || 'Vendor'
        const amt = (inv.amount || 0).toLocaleString('en-IN')
        const st = (inv.status || '').toLowerCase()
        let act = 'uploaded & extracted'
        let cmt = `Submitted invoice data for ${vendor}`
        let actorName = inv.uploadedBy?.name || 'Finance Exec'

        if (st === 'paid') {
          act = 'disbursed payment'
          cmt = `Payment of ₹${amt} completed for ${vendor}`
          actorName = inv.paidBy?.name || 'Finance Team'
        } else if (st === 'approved' || st === 'payment_queue') {
          act = 'approved'
          cmt = `Approved invoice ${invNo} for ₹${amt}`
          actorName = 'Finance Manager'
        } else if (st === 'pending' || st === 'pending_approval') {
          act = 'queued for manager approval'
          cmt = `Invoice ${invNo} (${vendor} — ₹${amt}) pending authorization`
          actorName = inv.uploadedBy?.name || 'Finance Exec'
        } else if (st === 'rejected' || st === 'needs_correction') {
          act = 'rejected invoice'
          cmt = inv.managerComment || 'Invoice returned for corrections'
          actorName = 'Finance Manager'
        }

        return {
          _id: `fb_mgr_act_${inv._id || idx}_${idx}`,
          performedBy: { name: actorName },
          invoiceId: { invoiceNumber: invNo, vendorName: vendor, amount: inv.amount },
          action: act,
          comment: cmt,
          timestamp: inv.updatedAt || inv.createdAt || new Date(Date.now() - (idx + 1) * 3600000),
        }
      })

      const existingInvNos = new Set(list.map((l) => l.invoiceId?.invoiceNumber).filter(Boolean))
      for (const fb of fallbackItems) {
        if (!existingInvNos.has(fb.invoiceId.invoiceNumber)) {
          list.push(fb)
        }
      }
    }
    return list.slice(0, 8)
  }, [activityTimeline, invoices])

  // Calculate Risk / Exception Overview across ALL invoices regardless of status
  const effectiveRiskOverview = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const allInvs = Array.isArray(invoices) ? invoices : []
    let duplicateInvoices = 0
    let missingFields = 0
    let highValueInvoices = 0
    let overduePayments = 0

    allInvs.forEach((inv) => {
      if (inv.duplicate || inv.duplicateRisk || inv.aiFlag === 'Duplicate Risk') {
        duplicateInvoices++
      }
      if ((inv.confidenceScore || 100) < 80 || (inv.missingMandatoryFields && inv.missingMandatoryFields.length > 0)) {
        missingFields++
      }
      if (Number(inv.amount || inv.totalAmount || 0) >= 100000) {
        highValueInvoices++
      }
      const st = (inv.status || '').toLowerCase()
      if (st !== 'paid' && inv.dueDate && !isNaN(new Date(inv.dueDate).getTime())) {
        const due = new Date(inv.dueDate)
        due.setHours(0, 0, 0, 0)
        if (due.getTime() < today.getTime()) {
          overduePayments++
        }
      }
    })

    return {
      duplicateInvoices: Math.max(duplicateInvoices, riskOverview.duplicateInvoices || 0),
      missingFields: Math.max(missingFields, riskOverview.missingFields || 0),
      highValueInvoices: Math.max(highValueInvoices, riskOverview.highValueInvoices || 0),
      overduePayments: Math.max(overduePayments, riskOverview.overduePayments || 0),
    }
  }, [riskOverview, invoices])

  // KPI Metrics calculation (Org-wide - Approved Invoices Only)
  const totalVolumeAmount = useMemo(() => {
    if (stats.approvedVolumeAmount !== undefined && stats.approvedVolumeAmount !== null) {
      return stats.approvedVolumeAmount
    }
    return invoices
      .filter((inv) => ['approved', 'payment_queue', 'paid'].includes((inv.status || '').toLowerCase()))
      .reduce((acc, inv) => acc + Number(inv.amount || inv.totalAmount || 0), 0)
  }, [stats.approvedVolumeAmount, invoices])

  const paymentQueueAmount = stats.paymentQueueAmount || 0

  // Monthly org spending chart data (Approved Invoices Only)
  const orgChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    const map = {}
    months.forEach((m) => {
      map[m] = { month: m, count: 0, value: 0 }
    })

    invoices.forEach((inv) => {
      const st = (inv.status || '').toLowerCase()
      const isApproved = ['approved', 'payment_queue', 'paid'].includes(st)
      if (isApproved) {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
        const mKey = d.toLocaleString('en-US', { month: 'short' })
        if (map[mKey]) {
          map[mKey].count += 1
          map[mKey].value += Number(inv.amount || inv.totalAmount || 0)
        }
      }
    })

    return Object.values(map)
  }, [invoices])

  // Approval Analytics Data
  const approvalAnalyticsData = useMemo(() => {
    let approvedCount = 0,
      approvedValue = 0,
      pendingCount = 0,
      pendingValue = 0,
      rejectedCount = 0,
      rejectedValue = 0,
      resubmittedCount = 0,
      resubmittedValue = 0

    invoices.forEach((inv) => {
      const st = (inv.status || '').toLowerCase()
      const amt = Number(inv.amount || inv.totalAmount || 0)
      if (st === 'approved' || st === 'payment_queue' || st === 'paid') {
        approvedCount++
        approvedValue += amt
      } else if (st === 'pending') {
        pendingCount++
        pendingValue += amt
      } else if (st === 'rejected' || st === 'needs_correction') {
        rejectedCount++
        rejectedValue += amt
      } else if (st === 'resubmitted') {
        resubmittedCount++
        resubmittedValue += amt
      }
    })

    return [
      { name: 'Approved', count: approvedCount, value: approvedValue, color: '#10b981' },
      { name: 'Pending', count: pendingCount, value: pendingValue, color: '#f59e0b' },
      { name: 'Rejected', count: rejectedCount, value: rejectedValue, color: '#ef4444' },
      { name: 'Resubmitted', count: resubmittedCount, value: resubmittedValue, color: '#6366f1' },
    ]
  }, [invoices])

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700">
              Manager Control Center
            </span>
            <span className="text-xs text-slate-400 font-medium">• Organization-Wide View</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">
            Manager Overview
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Monitor invoice processing, approvals, payments, and exceptions across your finance team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/app/approval-queue')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <span>Review Approval Queue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 1. KPI CARDS (6 CARDS) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {/* Total Invoices */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Invoices</span>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {stats.totalInvoices || invoices.length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">All Finance Executives</p>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-amber-600">
            Pending Approvals
          </span>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {stats.pendingApprovals || 0}
          </p>
          <p className="text-[10px] text-slate-500 font-bold">Needs Your Review</p>
        </motion.div>

        {/* Approved This Month */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-emerald-600">
            Approved This Month
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {stats.approvedInvoices || 0}
          </p>
          <p className="text-[10px] text-slate-500 font-bold">Passed Manager Audit</p>
        </motion.div>

        {/* Payment Queue */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-blue-600">
            Payment Queue
          </span>
          <p className="mt-1 text-2xl font-black text-blue-600">
            {stats.paymentQueueCount || 0}
          </p>
          <p className="text-[10px] text-slate-500 font-bold">Queued for Finance</p>
        </motion.div>

        {/* Total Invoice Value */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Invoice Value</span>
          <p className="mt-1 text-xl font-black text-slate-900">
            {formatCurrency(totalVolumeAmount)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold text-emerald-600">Approved Spend Volume</p>
        </motion.div>

        {/* Overdue Payments */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span className="text-[10px] font-extrabold uppercase text-red-600">
            Overdue Payments
          </span>
          <p className="mt-1 text-2xl font-black text-red-600">
            {stats.overdueCount || 0}
          </p>
          <p className="text-[10px] text-slate-500 font-bold">Finance Action Pending</p>
        </motion.div>
      </div>

      {/* 2 & 3: CHARTS SECTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2. APPROVAL ANALYTICS CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Approval Analytics</h3>
                <p className="text-[11px] text-slate-400 font-medium">Breakdown of manager approval workflow</p>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
                <button
                  onClick={() => setApprovalAnalyticsTab('count')}
                  className={`rounded-lg px-3 py-1 transition ${
                    approvalAnalyticsTab === 'count'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Count
                </button>
                <button
                  onClick={() => setApprovalAnalyticsTab('value')}
                  className={`rounded-lg px-3 py-1 transition ${
                    approvalAnalyticsTab === 'value'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Value
                </button>
              </div>
            </div>

            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={approvalAnalyticsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    ticks={approvalAnalyticsTab === 'count' ? [0, 5, 15, 25, 35] : undefined}
                    domain={approvalAnalyticsTab === 'count' ? [0, 35] : undefined}
                    tickFormatter={(val) =>
                      approvalAnalyticsTab === 'value'
                        ? `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                        : val
                    }
                  />
                  <ReTooltip
                    formatter={(val) => [
                      approvalAnalyticsTab === 'value' ? formatCurrency(val) : `${val} Invoices`,
                      approvalAnalyticsTab === 'value' ? 'Amount' : 'Count',
                    ]}
                  />
                  <Bar
                    dataKey={approvalAnalyticsTab === 'value' ? 'value' : 'count'}
                    radius={[6, 6, 0, 0]}
                  >
                    {approvalAnalyticsData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. ORGANIZATION SPENDING CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Organization Spending</h3>
                <p className="text-[11px] text-slate-400 font-medium">Monthly aggregate across all finance executives</p>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
                <button
                  onClick={() => setOrgSpendingTab('count')}
                  className={`rounded-lg px-3 py-1 transition ${
                    orgSpendingTab === 'count'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Count
                </button>
                <button
                  onClick={() => setOrgSpendingTab('value')}
                  className={`rounded-lg px-3 py-1 transition ${
                    orgSpendingTab === 'value'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Value
                </button>
              </div>
            </div>

            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    ticks={orgSpendingTab === 'count' ? [0, 5, 15, 25, 35] : undefined}
                    domain={orgSpendingTab === 'count' ? [0, 35] : undefined}
                    tickFormatter={(val) =>
                      orgSpendingTab === 'value'
                        ? `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                        : val
                    }
                  />
                  <ReTooltip
                    formatter={(val) => [
                      orgSpendingTab === 'value' ? formatCurrency(val) : `${val} Invoices`,
                      orgSpendingTab === 'value' ? 'Org Value' : 'Volume',
                    ]}
                  />
                  <Bar
                    dataKey={orgSpendingTab === 'value' ? 'value' : 'count'}
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>



      {/* 5. NEEDS YOUR ATTENTION (PRIORITY TABLE) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Needs Your Attention
            </h3>
            <p className="text-[11px] font-medium text-slate-400">
              High-priority invoices requiring immediate Manager decision
            </p>
          </div>
          <button
            onClick={() => navigate('/app/approval-queue')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View Full Approval Queue →
          </button>
        </div>

        <div className="overflow-x-auto my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">Finance Executive</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Risk Flag</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {attentionInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    No high-risk invoices currently requiring attention.
                  </td>
                </tr>
              ) : (
                attentionInvoices.slice(0, 6).map((inv) => (
                  <tr
                    key={inv._id}
                    className={`transition ${
                      inv.duplicate || inv.duplicateRisk || inv.aiFlag === 'Duplicate Risk'
                        ? 'bg-red-50 hover:bg-red-100/90 border-l-4 border-l-red-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber || 'INV-001'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">
                        {inv.uploadedBy?.name || 'Finance Exec'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {inv.vendorName || 'Vendor'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {inv.duplicate ? (
                        <span className="inline-block rounded-md bg-red-100 border border-red-300 px-2 py-0.5 text-[9px] font-black text-red-700 uppercase">
                          Duplicate Flagged
                        </span>
                      ) : inv.amount >= 100000 ? (
                        <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase">
                          High Value ({formatCurrency(inv.amount)})
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => navigate(`/app/invoices/${inv._id}`)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-[10px] font-black text-white hover:bg-blue-700 transition shadow-xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 & 7: RISK OVERVIEW & PAYMENT OVERVIEW */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 6. RISK / EXCEPTION OVERVIEW */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">Risk / Exception Indicators</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Monitors</span>
          </div>

          <div className="space-y-4 mt-4 text-xs">
            {/* Duplicate Invoices */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700">Duplicate Invoices Flagged</span>
                <span className="text-red-600">{effectiveRiskOverview.duplicateInvoices || 0} Flagged</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${Math.min((effectiveRiskOverview.duplicateInvoices || 0) * 20, 100)}%` }}
                />
              </div>
            </div>

            {/* Low Confidence Extractions */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700">Validation / Low Confidence Items</span>
                <span className="text-amber-600">{effectiveRiskOverview.missingFields || 0} Invoices</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min((effectiveRiskOverview.missingFields || 0) * 15, 100)}%` }}
                />
              </div>
            </div>

            {/* High Value Invoices */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700">High Value Invoices (&gt; ₹1 Lakh)</span>
                <span className="text-blue-600">{effectiveRiskOverview.highValueInvoices || 0} Invoices</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min((effectiveRiskOverview.highValueInvoices || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Overdue Payments */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700">Overdue Payments (All Invoices)</span>
                <span className="text-red-600">{effectiveRiskOverview.overduePayments || 0} Overdue</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: `${Math.min((effectiveRiskOverview.overduePayments || 0) * 25, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7. PAYMENT OVERVIEW (MANAGER VIEW - NO DISBURSEMENT POWER) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Org Payment Status</h3>
                <p className="text-[11px] font-medium text-slate-400">Finance department disbursement metrics</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                <Lock className="h-3 w-3" />
                Read-Only (Finance Only Action)
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mt-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Awaiting Payment</span>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {formatCurrency(paymentQueueAmount)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="text-[10px] font-extrabold uppercase text-red-600">Overdue</span>
                <p className="mt-1 text-lg font-black text-red-600">
                  {formatCurrency(stats.overdueAmount || 0)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-600">
                  Due Soon
                </span>
                <p className="mt-1 text-lg font-black text-amber-600">
                  {formatCurrency(stats.dueSoonAmount || 0)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600">
                  Paid This Month
                </span>
                <p className="mt-1 text-lg font-black text-emerald-600">
                  {formatCurrency(stats.paidThisMonthAmount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. RECENT ORGANIZATION ACTIVITY TIMELINE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">Recent Organization Activity</h3>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
            Team Audit Stream ({effectiveActivities.length} Events)
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {effectiveActivities.map((log) => (
            <div key={log._id} className="flex items-center gap-3 text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
              <img
                src={
                  log.performedBy?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.performedBy?.name || 'User'}`
                }
                alt={log.performedBy?.name || 'User'}
                className="h-7 w-7 rounded-full bg-slate-100 object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-900 truncate">
                    <span className="text-blue-600">{log.performedBy?.name || 'Finance Exec'}</span>{' '}
                    <span className="font-normal text-slate-600">
                      {log.action || 'updated'}
                    </span>{' '}
                    invoice{' '}
                    <span className="font-mono text-slate-900 font-bold">
                      {log.invoiceId?.invoiceNumber || 'INV-001'}
                    </span>
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {log.comment || 'Action recorded in ledger'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
