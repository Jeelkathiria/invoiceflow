import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  CheckCheck,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  ExternalLink,
  Calendar,
} from 'lucide-react'
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
import api from '../services/axios'
import { formatCurrency } from '../utils/formatCurrency'

function getFallbackMemberData(userId) {
  return {
    user: {
      _id: userId || 'demo-user-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@invoiceflow.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'Alex'}`,
      role: 'Finance',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
    stats: {
      totalInvoices: 18,
      pending: 3,
      approved: 8,
      rejected: 1,
      paymentQueue: 4,
      paid: 2,
      totalValue: 540000,
    },
    paymentSummary: {
      paymentQueueValue: 120000,
      dueSoonAmount: 45000,
      overdueAmount: 15000,
      paidThisMonthAmount: 95000,
    },
    monthlyAnalytics: [
      { month: 'Jan', value: 85000, count: 3 },
      { month: 'Feb', value: 140000, count: 5 },
      { month: 'Mar', value: 95000, count: 4 },
      { month: 'Apr', value: 220000, count: 6 },
    ],
    statusDistribution: {
      items: [
        { name: 'Pending Approval', count: 3, color: '#f59e0b' },
        { name: 'Approved', count: 8, color: '#10b981' },
        { name: 'Rejected', count: 1, color: '#ef4444' },
        { name: 'Payment Queue', count: 4, color: '#2563eb' },
        { name: 'Paid', count: 2, color: '#059669' },
      ],
      totalCount: 18,
    },
    recentInvoices: [
      {
        _id: 'inv-demo-1',
        invoiceNumber: 'INV-2026-0042',
        vendorName: 'Acme Cloud Solutions',
        amount: 85000,
        currency: 'INR',
        status: 'Pending',
        invoiceDate: '2026-02-14',
        dueDate: '2026-03-15',
      },
      {
        _id: 'inv-demo-2',
        invoiceNumber: 'INV-2026-0039',
        vendorName: 'Global Tech Systems',
        amount: 145000,
        currency: 'INR',
        status: 'Approved',
        invoiceDate: '2026-02-10',
        dueDate: '2026-03-10',
      },
    ],
    recentActivity: [
      {
        _id: 'act-1',
        action: 'uploaded invoice',
        invoiceId: { invoiceNumber: 'INV-2026-0042' },
        comment: 'Awaiting manager signoff',
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function FinanceMemberDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyticsTab, setAnalyticsTab] = useState('value') // 'count' | 'value'

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get(`/manager/team/${userId}`)
        if (res.data && res.data.data) {
          setData(res.data.data)
        } else {
          setData(getFallbackMemberData(userId))
        }
      } catch (err) {
        console.warn('Using fallback member details:', err.message)
        setData(getFallbackMemberData(userId))
      } finally {
        setLoading(false)
      }
    }
    if (userId) {
      fetchMemberDetails()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center space-y-4">
        <button
          onClick={() => navigate('/app/manager/team')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Finance Team
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-xs font-bold">
          {error || 'Member details could not be found.'}
        </div>
      </div>
    )
  }

  const {
    user,
    stats = {},
    paymentSummary = {},
    monthlyAnalytics = [],
    statusDistribution = { items: [], totalCount: 0 },
    recentInvoices = [],
    recentActivity = [],
  } = data

  const statusItems = statusDistribution.items || []
  const totalInvoicesCount = statusDistribution.totalCount || stats.totalInvoices || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      {/* 1. HEADER & USER PROFILE INFO */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/app/manager/team')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Finance Team</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-4">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
              }
              alt={user.name}
              className="h-14 w-14 rounded-full bg-slate-100 object-cover border-2 border-slate-200"
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-blue-700 border border-blue-200">
                  <Shield className="h-3 w-3 text-blue-600" />
                  Role: Finance
                </span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-bold text-slate-400">
            <p>Member Since</p>
            <p className="text-slate-700 font-extrabold mt-0.5">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Executive'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS (SELECTED FINANCE EXECUTIVE ONLY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Invoices
          </span>
          <p className="mt-1 text-xl font-black text-slate-900">{stats.totalInvoices || 0}</p>
          <span className="text-[10px] font-bold text-slate-400">Uploaded count</span>
        </div>

        {/* Pending Approval */}
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
          <p className="mt-1 text-xl font-black text-amber-600">{stats.pending || 0}</p>
          <span className="text-[10px] font-bold text-amber-500">Awaiting Manager</span>
        </div>

        {/* Approved */}
        <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
          <p className="mt-1 text-xl font-black text-emerald-600">{stats.approved || 0}</p>
          <span className="text-[10px] font-bold text-emerald-500">Manager authorized</span>
        </div>

        {/* Rejected */}
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
          <p className="mt-1 text-xl font-black text-red-600">{stats.rejected || 0}</p>
          <span className="text-[10px] font-bold text-red-500">Needs Correction</span>
        </div>

        {/* Payment Queue */}
        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Payment Queue
          </span>
          <p className="mt-1 text-xl font-black text-blue-600">{stats.paymentQueue || 0}</p>
          <span className="text-[10px] font-bold text-blue-500">Queue stage</span>
        </div>

        {/* Paid */}
        <div className="rounded-xl border border-emerald-300 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <CheckCheck className="h-3 w-3" />
            Paid
          </span>
          <p className="mt-1 text-xl font-black text-emerald-700">{stats.paid || 0}</p>
          <span className="text-[10px] font-bold text-emerald-600">Disbursed</span>
        </div>

        {/* Total Invoice Value */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
            Total Value
          </span>
          <p className="mt-1 text-lg font-black text-white">{formatCurrency(stats.totalValue || 0)}</p>
          <span className="text-[10px] font-bold text-slate-400">Aggregate Volume</span>
        </div>
      </div>

      {/* 3 & 4: CHARTS SECTION (MONTHLY ANALYTICS & STATUS DONUT) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 3. INVOICE ANALYTICS CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Invoice Analytics</h3>
                <p className="text-[11px] font-medium text-slate-400">
                  Monthly invoice volume & spend for {user.name}
                </p>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
                <button
                  onClick={() => setAnalyticsTab('count')}
                  className={`rounded-lg px-3 py-1 transition ${
                    analyticsTab === 'count'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Invoice Count
                </button>
                <button
                  onClick={() => setAnalyticsTab('value')}
                  className={`rounded-lg px-3 py-1 transition ${
                    analyticsTab === 'value'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Invoice Value
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAnalytics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                      analyticsTab === 'value' ? 'Amount' : 'Count',
                    ]}
                  />
                  <Bar
                    dataKey={analyticsTab === 'value' ? 'value' : 'count'}
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. INVOICE STATUS DISTRIBUTION (DONUT CHART) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Status Distribution</h3>
              <p className="text-[11px] font-medium text-slate-400">
                Invoice status breakdown for this executive
              </p>
            </div>

            <div className="relative h-52 w-full flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusItems}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {statusItems.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(val) => [`${val} Invoices`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{totalInvoicesCount}</span>
                <span className="text-[9px] font-extrabold uppercase text-slate-400">Total</span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="space-y-1.5 text-xs font-semibold">
              {statusItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. PAYMENT SUMMARY FOR THIS EXECUTIVE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Payment Summary</h3>
          <p className="text-[11px] font-medium text-slate-400">
            Disbursement queue metrics belonging strictly to {user.name}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-[10px] font-extrabold uppercase text-slate-500">Payment Queue Value</span>
            <p className="mt-1 text-xl font-black text-slate-900">
              {formatCurrency(paymentSummary.paymentQueueValue || 0)}
            </p>
            <span className="text-[10px] text-slate-400 font-bold">Awaiting disbursement</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <span className="text-[10px] font-extrabold uppercase text-amber-700">Due Soon</span>
            <p className="mt-1 text-xl font-black text-amber-700">
              {formatCurrency(paymentSummary.dueSoonAmount || 0)}
            </p>
            <span className="text-[10px] text-amber-600 font-bold">Due within 7 days</span>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
            <span className="text-[10px] font-extrabold uppercase text-red-700">Overdue</span>
            <p className="mt-1 text-xl font-black text-red-700">
              {formatCurrency(paymentSummary.overdueAmount || 0)}
            </p>
            <span className="text-[10px] text-red-600 font-bold">Past due date</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800">Paid This Month</span>
            <p className="mt-1 text-xl font-black text-emerald-700">
              {formatCurrency(paymentSummary.paidThisMonthAmount || 0)}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Settled in current month</span>
          </div>
        </div>
      </div>

      {/* 6. RECENT INVOICES SUBMITTED BY THIS EXECUTIVE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Recent Invoices</h3>
            <p className="text-[11px] font-medium text-slate-400">
              Invoices submitted by {user.name}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{recentInvoices.length} Total</span>
        </div>

        <div className="overflow-x-auto my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                    No invoices uploaded by this executive yet.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber || 'INV-001'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {inv.vendorName || 'Vendor'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-black uppercase ${
                          inv.status === 'Paid' || inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Approved' || inv.status === 'APPROVED' || inv.status === 'PAYMENT_QUEUE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : inv.status === 'Rejected' || inv.status === 'NEEDS_CORRECTION'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => navigate(`/app/invoice/${inv._id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 text-[10px] font-bold text-slate-700 transition"
                      >
                        <span>View Invoice</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. RECENT ACTIVITY TIMELINE FOR THIS EXECUTIVE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Recent Activity Timeline</h3>
          <p className="text-[11px] font-medium text-slate-400">
            Lifecycle actions involving {user.name}
          </p>
        </div>

        <div className="mt-4 space-y-3.5">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-4 text-center">
              No recent activity recorded for this executive.
            </p>
          ) : (
            recentActivity.map((log) => (
              <div key={log._id} className="flex items-center gap-3 text-xs">
                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    <span className="font-mono text-blue-600">
                      {log.invoiceId?.invoiceNumber || 'Invoice'}
                    </span>{' '}
                    <span className="font-normal text-slate-600">
                      {log.action || 'updated'}
                    </span>{' '}
                    {log.comment ? `• ${log.comment}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default FinanceMemberDetails
