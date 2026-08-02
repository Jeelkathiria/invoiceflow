import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/axios'
import { Sparkles, Plus, AlertCircle, ArrowRight, Zap, FileText, CheckCircle2, RefreshCw, XCircle, Clock } from 'lucide-react'
import { CardSummary } from '../components/dashboard/CardSummary'
import { RecentUploads } from '../components/dashboard/RecentUploads'
import { PendingQueue } from '../components/dashboard/PendingQueue'
import { UpcomingPayments } from '../components/dashboard/UpcomingPayments'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline'
import { ExpenseAnalytics } from '../components/dashboard/ExpenseAnalytics'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole === 'manager'
  const isFinance = userRole === 'finance'

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices')
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        setInvoices(res.data.data.invoices)
      } else {
        setInvoices([])
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch live invoices:', err)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Filter out Draft invoices (only include invoices submitted / sent for approval by Finance)
  const submittedInvoices = useMemo(() => {
    return invoices.filter((i) => i.status && i.status.toLowerCase() !== 'draft')
  }, [invoices])

  // Dynamic KPI metrics calculated cleanly from submitted live MongoDB data (0 if empty)
  const dynamicKpis = useMemo(() => {
    const totalCount = submittedInvoices.length
    const pendingInvoices = submittedInvoices.filter((i) => i.status === 'Pending' && !i.duplicate)
    const pendingCount = pendingInvoices.length

    const approvedInvoices = submittedInvoices.filter((i) => i.status === 'Approved')
    const approvedCount = approvedInvoices.length
    const approvedTotal = approvedInvoices.reduce((sum, i) => sum + Number(i.amount || i.totalAmount || 0), 0)

    const rejectedInvoices = submittedInvoices.filter((i) => i.status === 'Rejected')
    const rejectedCount = rejectedInvoices.length

    const totalAmount = submittedInvoices.reduce((sum, i) => sum + Number(i.amount || i.totalAmount || 0), 0)

    const formattedApproved = `₹${approvedTotal.toLocaleString('en-IN')}`
    const formattedTotalAmount = `₹${totalAmount.toLocaleString('en-IN')}`

    if (isManager) {
      // MANAGER DASHBOARD SPECIFIC METRICS:
      // Pending Approvals, Approved Today, Rejected Today, Total Approval Amount
      return [
        {
          title: 'Pending Approvals',
          value: pendingCount.toString(),
          change: pendingCount > 0 ? 'Requires review & action' : 'No items awaiting review',
          trend: 'up',
          icon: Clock,
          color: 'amber',
          description: 'Awaiting Manager Signoff',
        },
        {
          title: 'Approved Today',
          value: approvedCount.toString(),
          change: approvedCount > 0 ? 'Cleared for settlement' : 'No approved items today',
          trend: 'up',
          icon: CheckCircle2,
          color: 'green',
          description: 'Cleared for Settlement',
        },
        {
          title: 'Rejected Today',
          value: rejectedCount.toString(),
          change: rejectedCount > 0 ? 'Audit anomalies caught' : 'No rejected items',
          trend: 'down',
          icon: XCircle,
          color: 'rose',
          description: 'Pricing / Data Discrepancies',
        },
        {
          title: 'Total Approval Amount',
          value: formattedApproved,
          change: approvedTotal > 0 ? 'Authorized budget release' : '₹0 cleared amount',
          trend: 'up',
          icon: Sparkles,
          color: 'blue',
          description: 'Cumulative Cleared Value',
        },
      ]
    } else {
      // FINANCE DASHBOARD SPECIFIC METRICS:
      // Total Invoices, Pending Approval, Approved, Rejected, Total Invoice Amount
      return [
        {
          title: 'Total Invoices',
          value: totalCount.toString(),
          change: totalCount > 0 ? `${totalCount} ingested invoices` : '0 uploaded invoices',
          trend: 'up',
          icon: FileText,
          color: 'blue',
          description: 'Ingested & Parsed',
        },
        {
          title: 'Pending Approval',
          value: pendingCount.toString(),
          change: pendingCount > 0 ? 'Sent to Manager queue' : '0 pending approval',
          trend: 'up',
          icon: AlertCircle,
          color: 'amber',
          description: 'Awaiting Manager Review',
        },
        {
          title: 'Approved',
          value: approvedCount.toString(),
          change: approvedCount > 0 ? 'Settlements cleared' : '0 approved',
          trend: 'up',
          icon: CheckCircle2,
          color: 'green',
          description: 'Payment Authorized',
        },
        {
          title: 'Total Invoice Amount',
          value: formattedTotalAmount,
          change: totalAmount > 0 ? 'Cumulative value' : '₹0 invoice value',
          trend: 'up',
          icon: Sparkles,
          color: 'blue',
          description: 'Total Financial Value',
        },
      ]
    }
  }, [invoices, isManager])

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-700">
              {isManager ? 'Manager Portal' : 'Finance Executive'}
            </span>
            <span className="text-xs text-slate-400 font-medium">• Live MongoDB Sync</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            {isManager
              ? 'Review pending approvals, audit AI extractions, and authorize invoice payments.'
              : 'Upload invoices, review AI extracted data, and submit for manager approval.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {isFinance && (
            <button
              onClick={() => navigate('/app/upload')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Upload Invoice</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={() => navigate('/app/approval-queue')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              <span>Review Approval Queue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicKpis.map((kpi, idx) => (
          <CardSummary key={idx} {...kpi} />
        ))}
      </div>

      {/* Main Grid View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <ExpenseAnalytics liveInvoices={submittedInvoices} />
          {isManager ? (
            <PendingQueue liveInvoices={submittedInvoices} />
          ) : (
            <RecentUploads liveInvoices={submittedInvoices} />
          )}
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {isManager ? (
            <RecentUploads liveInvoices={submittedInvoices} />
          ) : (
            <PendingQueue liveInvoices={submittedInvoices} />
          )}
          <UpcomingPayments liveInvoices={submittedInvoices} />
          <ActivityTimeline liveInvoices={submittedInvoices} />
        </div>
      </div>
    </div>
  )
}
