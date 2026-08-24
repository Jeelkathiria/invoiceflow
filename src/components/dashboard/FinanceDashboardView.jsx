import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  FileText,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  IndianRupee,
  Activity,
  Calendar,
  AlertTriangle,
  Eye,
  Check,
  Zap,
  ShieldAlert,
  Trash2,
  Loader2,
  X,
} from 'lucide-react'
import api from '../../services/axios'
import { formatCurrency } from '../../utils/formatCurrency'

export function FinanceDashboardView({
  user,
  stats = {},
  invoices = [],
  activityTimeline = [],
  onMarkAsPaid,
  onRefresh,
  loading,
}) {
  const navigate = useNavigate()

  // Timeframe state
  const [timeframe, setTimeframe] = useState('month')
  const [analyticsTab, setAnalyticsTab] = useState('value') // 'count' | 'value'

  // Mark as Paid Confirmation Modal state
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null)
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const handleConfirmPaymentModal = async () => {
    if (!selectedInvoiceForPayment) return
    setSubmittingPayment(true)
    try {
      if (onMarkAsPaid) {
        await onMarkAsPaid(selectedInvoiceForPayment._id)
      } else {
        await api.patch(`/invoices/${selectedInvoiceForPayment._id}/mark-paid`)
        if (onRefresh) onRefresh()
      }
    } catch (err) {
      console.error('Payment failed:', err)
    } finally {
      setSubmittingPayment(false)
      setSelectedInvoiceForPayment(null)
    }
  }

  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to delete rejected invoice ${invoiceNumber || ''}?`)) return
    try {
      if (id && !id.startsWith('inv-demo')) {
        await api.delete(`/invoices/${id}`)
      }
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Failed to delete invoice:', err)
    }
  }

  // Combine activityTimeline with fallback generated activities to guarantee at least 3 recent activities
  const effectiveActivities = useMemo(() => {
    let list = Array.isArray(activityTimeline) ? [...activityTimeline] : []

    if (list.length < 3 && Array.isArray(invoices) && invoices.length > 0) {
      const fallbackItems = invoices.slice(0, 5).map((inv, idx) => {
        const invNo = inv.invoiceNumber || `INV-${String(idx + 1).padStart(3, '0')}`
        const vendor = inv.vendorName || 'Vendor'
        const amt = (inv.amount || 0).toLocaleString('en-IN')
        const st = (inv.status || '').toLowerCase()
        let act = 'extracted & ingested'
        let cmt = `Processed invoice data for ${vendor}`

        if (st === 'paid') {
          act = 'disbursed payment for'
          cmt = `Payment of ₹${amt} completed by Finance`
        } else if (st === 'approved' || st === 'payment_queue') {
          act = 'approved'
          cmt = `Manager approved invoice ₹${amt}`
        } else if (st === 'pending' || st === 'pending_approval') {
          act = 'submitted for manager approval'
          cmt = `Invoice ${invNo} queued for approval`
        } else if (st === 'rejected' || st === 'needs_correction') {
          act = 'returned for corrections'
          cmt = inv.managerComment || 'Invoice returned to Finance'
        }

        return {
          _id: `fb_fin_act_${inv._id || idx}_${idx}`,
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
    return list.slice(0, 6)
  }, [activityTimeline, invoices])

  // Table search & filter states
  const [approvalSearch, setApprovalSearch] = useState('')
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL')
  const [approvalPage, setApprovalPage] = useState(1)
  const itemsPerPage = 5

  // Greeting helper
  const greetingText = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Filter invoices for THIS finance user only (extra frontend safety check)
  const userInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) return []
    const currentUserId = user?._id || user?.id
    if (!currentUserId) return invoices
    return invoices.filter((inv) => {
      const uId = inv.uploadedBy?._id || inv.uploadedBy
      return !uId || uId === currentUserId || String(uId) === String(currentUserId)
    })
  }, [invoices, user])

  // Donut chart status breakdown data
  const statusBreakdown = useMemo(() => {
    const counts = {
      Draft: 0,
      'Pending Approval': 0,
      'Needs Correction': 0,
      'Payment Queue': 0,
      Paid: 0,
    }

    userInvoices.forEach((inv) => {
      const st = (inv.status || '').toLowerCase()
      if (st === 'draft') counts['Draft']++
      else if (st === 'pending') counts['Pending Approval']++
      else if (st === 'rejected' || st === 'needs_correction') counts['Needs Correction']++
      else if (st === 'payment_queue' || st === 'approved') counts['Payment Queue']++
      else if (st === 'paid') counts['Paid']++
    })

    const total = userInvoices.length || 1

    const COLORS = {
      Draft: '#94a3b8',
      'Pending Approval': '#f59e0b',
      'Needs Correction': '#ef4444',
      'Payment Queue': '#2563eb',
      Paid: '#10b981',
    }

    return Object.keys(counts).map((key) => ({
      name: key,
      count: counts[key],
      percentage: Math.round((counts[key] / total) * 100),
      color: COLORS[key],
    }))
  }, [userInvoices])

  // Monthly spending / count chart data
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    const dataMap = {}
    months.forEach((m) => {
      dataMap[m] = { month: m, count: 0, value: 0 }
    })

    userInvoices.forEach((inv) => {
      const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
      const mKey = d.toLocaleString('en-US', { month: 'short' })
      if (dataMap[mKey]) {
        dataMap[mKey].count += 1
        dataMap[mKey].value += Number(inv.amount || inv.totalAmount || 0)
      }
    })

    return Object.values(dataMap)
  }, [userInvoices])

  // My Pending Approvals table filter
  const pendingApprovalsList = useMemo(() => {
    return userInvoices.filter((inv) => {
      const st = (inv.status || '').toLowerCase()
      const matchesStatus =
        approvalStatusFilter === 'ALL'
          ? st === 'pending' || st === 'rejected' || st === 'needs_correction' || st === 'resubmitted'
          : st === approvalStatusFilter.toLowerCase()

      const q = approvalSearch.toLowerCase()
      const matchesSearch =
        !q ||
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.vendorName && inv.vendorName.toLowerCase().includes(q))

      return matchesStatus && matchesSearch
    })
  }, [userInvoices, approvalSearch, approvalStatusFilter])

  const paginatedPendingList = useMemo(() => {
    const start = (approvalPage - 1) * itemsPerPage
    return pendingApprovalsList.slice(start, start + itemsPerPage)
  }, [pendingApprovalsList, approvalPage])

  const totalPages = Math.ceil(pendingApprovalsList.length / itemsPerPage) || 1

  // My Payment Queue table list
  const paymentQueueList = useMemo(() => {
    return userInvoices.filter((inv) => {
      const st = (inv.status || '').toUpperCase()
      return st === 'PAYMENT_QUEUE' || st === 'APPROVED'
    })
  }, [userInvoices])

  // Payment Overview summary metrics
  const paymentOverviewMetrics = useMemo(() => {
    const awaitingAmount = stats.paymentQueueAmount || paymentQueueList.reduce((acc, i) => acc + (i.amount || 0), 0)
    const overdueAmount = stats.overdueAmount || 0
    const dueSoonAmount = stats.dueSoonAmount || 0
    const paidMonthAmount = stats.paidThisMonthAmount || 0

    return {
      awaitingAmount,
      overdueAmount,
      dueSoonAmount,
      paidMonthAmount,
    }
  }, [stats, paymentQueueList])

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700">
              Finance Executive Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">• Personal Ledger</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">
            {greetingText}, {user?.name || 'Finance Executive'}!
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Here's your personal invoice and payment overview.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/app/upload')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Upload Invoice</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 px-2">Quick Actions:</span>
        <button
          onClick={() => navigate('/app/upload')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload Invoice</span>
        </button>
        <button
          onClick={() => navigate('/app/sent-for-approval')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>Sent for Approval</span>
        </button>
        <button
          onClick={() => navigate('/app/payment-queue')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
          <span>View Payment Queue</span>
        </button>
        <button
          onClick={() => navigate('/app/invoices')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>View All My Invoices</span>
        </button>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invoices */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoices</span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.totalInvoices || userInvoices.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Uploaded by your account</p>
        </motion.div>

        {/* Pending Approval */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approval</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {stats.pendingApprovals || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Awaiting Manager signoff</p>
        </motion.div>

        {/* Payment Queue */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Queue</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {stats.paymentQueueCount || paymentQueueList.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">
            Value: {formatCurrency(stats.paymentQueueAmount || 0)}
          </p>
        </motion.div>

        {/* Paid */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Invoices</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {stats.paidCount || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-semibold">
            Disbursed: {formatCurrency(stats.paidTotalAmount || 0)}
          </p>
        </motion.div>
      </div>

      {/* 2 & 3: CHARTS SECTION */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* DONUT CHART: INVOICE STATUS OVERVIEW */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Status Overview</h3>
              <span className="text-[10px] font-bold uppercase text-slate-400">Your Invoices</span>
            </div>

            <div className="relative my-4 h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(val, name) => [`${val} Invoices`, name]} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900">
                  {userInvoices.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {statusBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART: SPENDING / VALUE ANALYTICS */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Invoice Overview</h3>
                <p className="text-[11px] text-slate-400 font-medium">Monthly breakdown of your uploaded invoices</p>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
                <button
                  onClick={() => setAnalyticsTab('count')}
                  className={`rounded-lg px-3 py-1 transition ${analyticsTab === 'count'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Invoice Count
                </button>
                <button
                  onClick={() => setAnalyticsTab('value')}
                  className={`rounded-lg px-3 py-1 transition ${analyticsTab === 'value'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Invoice Value
                </button>
              </div>
            </div>

            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    ticks={analyticsTab === 'count' ? [0, 5, 15, 25, 35] : undefined}
                    domain={analyticsTab === 'count' ? [0, 35] : undefined}
                    tickFormatter={(val) =>
                      analyticsTab === 'value'
                        ? `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                        : val
                    }
                  />
                  <ReTooltip
                    formatter={(val) => [
                      analyticsTab === 'value' ? formatCurrency(val) : `${val} Invoices`,
                      analyticsTab === 'value' ? 'Total Value' : 'Volume',
                    ]}
                  />
                  <Bar
                    dataKey={analyticsTab === 'value' ? 'value' : 'count'}
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PAYMENT OVERVIEW CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Payment Overview</h3>
            <p className="text-[11px] font-medium text-slate-400">Click status to filter Payment Queue</p>
          </div>
          <button
            onClick={() => navigate('/app/payment-queue')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Open Payment Queue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 mt-4">
          {/* Total Awaiting Payment */}
          <div
            onClick={() => navigate('/app/payment-queue')}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Awaiting Payment</span>
            <p className="mt-1 text-xl font-black text-slate-900">
              {formatCurrency(paymentOverviewMetrics.awaitingAmount)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Approved by Manager</p>
          </div>

          {/* Overdue */}
          <div
            onClick={() => navigate('/app/payment-queue?filter=OVERDUE')}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <span className="text-[10px] font-extrabold uppercase text-red-600 flex items-center gap-1">
              Overdue
            </span>
            <p className="mt-1 text-xl font-black text-red-600">
              {formatCurrency(paymentOverviewMetrics.overdueAmount)}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Requires Immediate Action</p>
          </div>

          {/* Due Soon */}
          <div
            onClick={() => navigate('/app/payment-queue?filter=DUE_SOON')}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <span className="text-[10px] font-extrabold uppercase text-amber-600 flex items-center gap-1">
              Due Soon
            </span>
            <p className="mt-1 text-xl font-black text-amber-600">
              {formatCurrency(paymentOverviewMetrics.dueSoonAmount)}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Due within 7 days</p>
          </div>

          {/* Paid This Month */}
          <div
            onClick={() => navigate('/app/payment-queue?filter=PAID')}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 flex items-center gap-1">
              Paid This Month
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600">
              {formatCurrency(paymentOverviewMetrics.paidMonthAmount)}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Disbursed by Finance</p>
          </div>
        </div>
      </div>

      {/* 5 & 6: TABLES SECTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 5. MY PENDING APPROVALS TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">My Pending Approvals</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {pendingApprovalsList.length} Items
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 my-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice or vendor..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
              <select
                value={approvalStatusFilter}
                onChange={(e) => setApprovalStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">Invoice</th>
                    <th className="py-2 px-2.5">Vendor</th>
                    <th className="py-2 px-2.5 text-right">Amount</th>
                    <th className="py-2 px-2.5 text-center">Status</th>
                    <th className="py-2 px-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPendingList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                        No pending approvals match your filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedPendingList.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-2.5 font-mono font-bold text-blue-600">
                          {inv.invoiceNumber || 'INV-000'}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-900">
                          {inv.vendorName || 'Vendor'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-black text-slate-900">
                          {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-black uppercase ${inv.status === 'Rejected' || inv.status === 'NEEDS_CORRECTION'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                          >
                            {inv.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/app/invoice/${inv._id}`)}
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition"
                            >
                              View
                            </button>
                            {(inv.status === 'Rejected' || inv.status === 'DUPLICATE_SUBMISSION' || inv.status === 'ALREADY_PAID') && (
                              <button
                                onClick={() => handleDeleteInvoice(inv._id, inv.invoiceNumber)}
                                className="rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                                title="Delete rejected invoice"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                Page {approvalPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={approvalPage === 1}
                  onClick={() => setApprovalPage((p) => Math.max(p - 1, 1))}
                  className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40 text-[10px] font-bold"
                >
                  Prev
                </button>
                <button
                  disabled={approvalPage === totalPages}
                  onClick={() => setApprovalPage((p) => Math.min(p + 1, totalPages))}
                  className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40 text-[10px] font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. MY PAYMENT QUEUE TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">My Payment Queue</h3>
              <span className="text-[10px] font-bold text-blue-600 uppercase">
                {paymentQueueList.length} Approved Invoices
              </span>
            </div>

            <div className="overflow-x-auto my-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">Invoice</th>
                    <th className="py-2 px-2.5">Vendor</th>
                    <th className="py-2 px-2.5 text-right">Amount</th>
                    <th className="py-2 px-2.5 text-center">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paymentQueueList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        No approved invoices currently waiting in payment queue.
                      </td>
                    </tr>
                  ) : (
                    paymentQueueList.slice(0, 5).map((inv) => {
                      const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date()
                      const priorityColor = isOverdue
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      const priorityText = isOverdue ? 'Overdue' : 'Scheduled'

                      return (
                        <tr key={inv._id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-2.5 font-mono font-bold text-blue-600">
                            <button
                              onClick={() => navigate(`/app/invoices/${inv._id}`)}
                              className="hover:underline cursor-pointer text-left"
                            >
                              {inv.invoiceNumber || 'INV-000'}
                            </button>
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-900">
                            {inv.vendorName || 'Vendor'}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-black text-slate-900">
                            {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span
                              className={`inline-block rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${priorityColor}`}
                            >
                              {priorityText}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => navigate('/app/payment-queue')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Manage Full Payment Queue ({paymentQueueList.length}) →
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TIMELINE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">Your Recent Activity</h3>
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
            Live Stream ({effectiveActivities.length} Events)
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {effectiveActivities.map((log) => (
            <div key={log._id} className="flex items-start gap-3 text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="mt-0.5 rounded-xl bg-blue-100 p-2 text-blue-600 shrink-0">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-900 truncate">
                    Invoice{' '}
                    <span className="font-mono text-blue-600">
                      {log.invoiceId?.invoiceNumber || 'INV-001'}
                    </span>{' '}
                    — <span className="capitalize text-slate-700">{log.action || log.status}</span>
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

      {/* MARK AS PAID CONFIRMATION MODAL */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-emerald-100 animate-in fade-in zoom-in duration-200 text-left">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                <h3 className="text-base font-black text-slate-900">Mark Invoice as Paid?</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Invoice Overview */}
            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Vendor:</span>
                <strong className="text-slate-900 font-bold">{selectedInvoiceForPayment.vendorName}</strong>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-blue-600">#{selectedInvoiceForPayment.invoiceNumber}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Approved Amount:</span>
                <strong className="text-emerald-700 font-black text-sm">
                  {formatCurrency(selectedInvoiceForPayment.amount || selectedInvoiceForPayment.totalAmount, selectedInvoiceForPayment.currency)}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Are you sure the payment has been completed? This will mark the invoice as <strong className="text-emerald-700">PAID</strong>, create an audit entry, and move the invoice into the Paid Ledger.
            </p>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPayment(null)}
                disabled={submittingPayment}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaymentModal}
                disabled={submittingPayment}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {submittingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                )}
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
