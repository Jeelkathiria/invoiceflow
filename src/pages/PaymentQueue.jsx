import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/axios'
import { formatCurrency, calculateMultiCurrencyTotals } from '../utils/formatCurrency'
import { getPaymentPriority } from '../utils/paymentPriority'
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  DollarSign,
  Calendar,
  UserCheck
} from 'lucide-react'

const ITEMS_PER_PAGE = 10

export function PaymentQueue() {
  const { user } = useAuth()
  const userRole = (user?.role || '').toLowerCase()
  const isFinance = userRole.includes('finance') || !userRole.includes('manager')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'All'

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(initialFilter) // All, Overdue, Due Soon, Scheduled
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Payment Confirmation Modal State
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchPaymentQueue = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices/payment-queue')
      let queueData = []
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        queueData = res.data.data.invoices
      } else if (res.data && Array.isArray(res.data.invoices)) {
        queueData = res.data.invoices
      }

      // Map raw MongoDB data
      const mapped = queueData.map((inv) => {
        const priorityMeta = getPaymentPriority(inv.dueDate)
        return {
          _id: inv._id,
          invoiceNumber: inv.invoiceNumber || 'INV-001',
          vendorName: inv.vendorName || 'Unknown Vendor',
          category: inv.category || 'General',
          amount: inv.amount || inv.totalAmount || 0,
          currency: inv.currency || 'INR',
          invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-',
          rawDueDate: inv.dueDate,
          approvedBy: inv.approvedBy?.name || 'Finance Manager',
          approvedAt: inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : '-',
          status: inv.status || 'PAYMENT_QUEUE',
          paymentStatus: inv.paymentStatus || 'PAYMENT_PENDING',
          priority: priorityMeta.priority,
          daysUntilDue: priorityMeta.daysUntilDue,
          dueLabel: priorityMeta.label,
          badgeStyle: priorityMeta.badgeStyle,
        }
      })

      setInvoices(mapped)
    } catch (err) {
      console.warn('[PaymentQueue] Error fetching payment queue:', err)
      // Fallback fallback if endpoint fails or demo fallback
      try {
        const allRes = await api.get('/invoices')
        if (allRes.data && allRes.data.data && Array.isArray(allRes.data.data.invoices)) {
          const queueOnly = allRes.data.data.invoices.filter((i) => i.status === 'Approved' || i.status === 'PAYMENT_QUEUE')
          const mapped = queueOnly.map((inv) => {
            const priorityMeta = getPaymentPriority(inv.dueDate)
            return {
              _id: inv._id,
              invoiceNumber: inv.invoiceNumber || 'INV-001',
              vendorName: inv.vendorName || 'Unknown Vendor',
              category: inv.category || 'General',
              amount: inv.amount || inv.totalAmount || 0,
              currency: inv.currency || 'INR',
              invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-',
              dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-',
              rawDueDate: inv.dueDate,
              approvedBy: inv.approvedBy?.name || 'Finance Manager',
              approvedAt: inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : '-',
              status: inv.status || 'PAYMENT_QUEUE',
              paymentStatus: inv.paymentStatus || 'PAYMENT_PENDING',
              priority: priorityMeta.priority,
              daysUntilDue: priorityMeta.daysUntilDue,
              dueLabel: priorityMeta.label,
              badgeStyle: priorityMeta.badgeStyle,
            }
          })
          setInvoices(mapped)
        } else {
          setInvoices([])
        }
      } catch (e) {
        setInvoices([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentQueue()
  }, [])

  useEffect(() => {
    const urlFilter = searchParams.get('filter')
    if (urlFilter) {
      if (urlFilter === 'due_soon') setFilter('Due Soon')
      else if (urlFilter === 'overdue') setFilter('Overdue')
      else if (urlFilter === 'all') setFilter('All')
    }
  }, [searchParams])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery])

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const matchesFilter =
        filter === 'All'
          ? true
          : filter === 'Overdue'
          ? item.priority === 'Overdue'
          : filter === 'Due Soon'
          ? item.priority === 'Due Soon'
          : filter === 'Scheduled'
          ? item.priority === 'Scheduled'
          : true

      const matchesSearch =
        (item.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [invoices, filter, searchQuery])

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  // Summary Metrics
  const totalAmountFormatted = useMemo(() => calculateMultiCurrencyTotals(invoices), [invoices])
  const overdueCount = invoices.filter((i) => i.priority === 'Overdue').length
  const dueSoonCount = invoices.filter((i) => i.priority === 'Due Soon').length
  const scheduledCount = invoices.filter((i) => i.priority === 'Scheduled').length

  // Handle Mark as Paid Confirmation
  const handleConfirmMarkAsPaid = async () => {
    if (!selectedInvoiceForPayment) return
    setSubmittingPayment(true)
    try {
      await api.patch(`/invoices/${selectedInvoiceForPayment._id}/mark-paid`)
      showToast(`Invoice #${selectedInvoiceForPayment.invoiceNumber} marked as PAID successfully!`, 'success')
      setInvoices((prev) => prev.filter((i) => i._id !== selectedInvoiceForPayment._id))
    } catch (err) {
      console.error('Mark as paid error:', err)
      showToast(err.response?.data?.message || 'Failed to mark invoice as paid', 'error')
    } finally {
      setSubmittingPayment(false)
      setSelectedInvoiceForPayment(null)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Quick Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Payment Queue (Finance)</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor manager-approved invoices, prioritize due dates, and mark payments as completed.
          </p>
        </div>

        {/* Total Queue Metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-xs text-center">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Awaiting Payment</span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <p className="text-base font-black text-slate-900">{totalAmountFormatted.formattedInr}</p>
              <span className="rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[11px] font-black text-blue-700">
                {invoices.length} Invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          onClick={() => setFilter('Overdue')}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
            filter === 'Overdue' ? 'border-rose-500 bg-rose-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-rose-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Overdue Invoices
            </span>
            <p className="text-2xl font-black text-rose-700">{overdueCount}</p>
          </div>
          <span className="rounded-xl bg-rose-100 p-3 text-rose-700 font-bold text-xs">Past Due</span>
        </button>

        <button
          onClick={() => setFilter('Due Soon')}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
            filter === 'Due Soon' ? 'border-amber-500 bg-amber-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Due Within 7 Days
            </span>
            <p className="text-2xl font-black text-amber-800">{dueSoonCount}</p>
          </div>
          <span className="rounded-xl bg-amber-100 p-3 text-amber-800 font-bold text-xs">High Priority</span>
        </button>

        <button
          onClick={() => setFilter('Scheduled')}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
            filter === 'Scheduled' ? 'border-blue-500 bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Scheduled / Standard
            </span>
            <p className="text-2xl font-black text-blue-700">{scheduledCount}</p>
          </div>
          <span className="rounded-xl bg-blue-100 p-3 text-blue-700 font-bold text-xs">Normal</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'All', label: `All Queue (${invoices.length})` },
            { id: 'Overdue', label: `Overdue (${overdueCount})` },
            { id: 'Due Soon', label: `Due Soon (${dueSoonCount})` },
            { id: 'Scheduled', label: `Scheduled (${scheduledCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor or invoice #..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Payment Queue Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Vendor & Category</th>
              <th className="py-3 px-4 text-right">Approved Amount</th>
              <th className="py-3 px-4">Approved By</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-center">Priority</th>
              <th className="py-3 px-4 text-center">Payment Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-xs font-bold">Loading payment queue...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No invoices in payment queue matching filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Approved invoices will automatically appear here for payment processing.</p>
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{row.invoiceNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900">{row.vendorName}</p>
                    <p className="text-[10px] text-slate-400">{row.category}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatCurrency(row.amount, row.currency)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{row.approvedBy}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {row.dueDate}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${row.badgeStyle}`}>
                      {row.priority === 'Overdue' ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : row.priority === 'Due Soon' ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <Calendar className="h-3 w-3" />
                      )}
                      {row.dueLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700">
                      <Clock className="h-3 w-3" /> Payment Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/app/invoice/${row._id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" /> View
                      </Link>

                      {isFinance && (
                        <button
                          onClick={() => setSelectedInvoiceForPayment(row)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" /> Mark as Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50">
            <span className="text-xs text-slate-500 font-medium">
              Page {currentPage} of {totalPages} ({filteredInvoices.length} total queue)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MARK AS PAID CONFIRMATION MODAL */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-emerald-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                <h3 className="text-base font-black text-slate-900">Mark Invoice as Paid?</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
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
                  {formatCurrency(selectedInvoiceForPayment.amount || selectedInvoiceForPayment.totalAmount || 0, selectedInvoiceForPayment.currency)}
                </strong>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Manager Authorized:</span>
                <span className="text-slate-800 font-semibold">{selectedInvoiceForPayment.approvedBy}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Are you sure the payment has been completed? This will mark the invoice as <strong className="text-emerald-700">PAID</strong>, create an audit entry, and render the invoice read-only.
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
                onClick={handleConfirmMarkAsPaid}
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
