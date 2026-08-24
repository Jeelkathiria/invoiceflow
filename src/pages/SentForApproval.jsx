import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/axios'
import {
  Send,
  Search,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  AlertTriangle,
  ArrowRight,
  Wrench,
  Trash2
} from 'lucide-react'
import { formatCurrency, calculateMultiCurrencyTotals } from '../utils/formatCurrency'

const ITEMS_PER_PAGE = 10

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '-' || dateStr === 'Invalid Date') return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

export function SentForApproval() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchSentInvoices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices?limit=100')
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        // Include Pending, NEEDS_CORRECTION (sent back for edit), and Rejected items
        const filtered = res.data.data.invoices.filter((inv) => {
          if (!inv.status) return false
          const st = inv.status.toLowerCase()
          return st === 'pending' || st === 'pending_approval' || st === 'needs_correction' || st === 'rejected' || st === 'duplicate_submission' || st === 'already_paid'
        })

        const mapped = filtered.map((inv) => ({
          _id: inv._id,
          invoiceNumber: inv.invoiceNumber || 'INV-001',
          vendorName: inv.vendorName || 'Unknown Vendor',
          amount: inv.amount || inv.totalAmount || 0,
          currency: inv.currency || 'INR',
          subtotal: inv.subtotal || 0,
          gst: inv.gst || 0,
          status: inv.status || 'Pending',
          rejectionComment: inv.rejectionComment || '',
          rejectionReason: inv.rejectionReason || '',
          submittedBy: 'Finance Executive',
          invoiceDate: formatDate(inv.invoiceDate),
          dueDate: formatDate(inv.dueDate),
          category: inv.category || 'General Invoices',
          confidenceScore: inv.confidenceScore || 95.0,
          duplicate: Boolean(inv.duplicate),
          matchedInvoice: inv.matchedInvoice || null,
          vendorGstin: inv.vendorGstin || '',
          invoiceUrl: inv.invoiceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          createdAt: inv.createdAt,
        }))
        setInvoices(mapped)
      } else {
        setInvoices([])
      }
    } catch (err) {
      console.warn('[SentForApproval] Failed to fetch sent invoices:', err)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to delete rejected invoice ${invoiceNumber || ''}?`)) return
    try {
      if (id && !id.startsWith('inv-demo')) {
        await api.delete(`/invoices/${id}`)
      }
      fetchSentInvoices()
    } catch (err) {
      console.error('Failed to delete invoice:', err)
    }
  }

  useEffect(() => {
    fetchSentInvoices()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Filter pending invoices sent for approval
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [invoices, searchTerm])

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  const sentTotals = useMemo(() => {
    return calculateMultiCurrencyTotals(filteredInvoices)
  }, [filteredInvoices])

  return (
    <div className="space-y-6 pb-8">
      {/* Header & KPI Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Sent for Approval</h1>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              Pending Manager Authorization
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Invoices submitted by your team awaiting manager review & sign-off</p>
        </div>

        {/* Quick Summary Cards */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Sent</span>
            <p className="text-sm font-black text-blue-600">{filteredInvoices.length} Invoices</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pending Value</span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <p className="text-sm font-black text-slate-900">{sentTotals.formattedInr}</p>
              <span className="rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[11px] font-extrabold text-blue-700">
                {sentTotals.formattedUsd}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Active Sent Queue</span>
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, invoice #, category..."
            className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Sent Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Invoice ID & Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date & Due Date</th>
                <th className="py-3.5 px-4">AI Confidence</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Approval Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Loading sent invoices...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="h-8 w-8 text-slate-300" />
                      <p className="font-bold text-slate-700">No invoices currently sent for approval.</p>
                      <p className="text-[11px] text-slate-400">Invoices passed from Upload Review will appear here.</p>
                      <button
                        onClick={() => navigate('/app/upload')}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                      >
                        <span>Upload New Invoice</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className={`transition ${
                      inv.duplicate || inv.matchedInvoice
                        ? 'bg-red-50 hover:bg-red-100/90 border-l-4 border-l-red-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600">{inv.invoiceNumber}</span>
                      <p className="font-bold text-slate-900 mt-0.5">{inv.vendorName}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {inv.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{inv.invoiceDate}</p>
                      <p className="text-[11px] text-slate-400">Due: {inv.dueDate}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <span>{inv.confidenceScore}%</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs ${
                          inv.status === 'NEEDS_CORRECTION' || inv.status === 'Needs Correction'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : inv.status === 'Rejected' || inv.status === 'DUPLICATE_SUBMISSION' || inv.status === 'ALREADY_PAID'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'NEEDS_CORRECTION' || inv.status === 'Needs Correction' ? (
                          <>
                            <Wrench className="h-3 w-3 text-amber-600" />
                            <span>Needs Correction</span>
                          </>
                        ) : inv.status === 'Rejected' || inv.status === 'DUPLICATE_SUBMISSION' || inv.status === 'ALREADY_PAID' ? (
                          <>
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            <span>Rejected</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Sent for Approval</span>
                          </>
                        )}
                      </span>
                      {inv.rejectionComment && (
                        <p className="text-[10px] text-amber-800 font-semibold mt-1 max-w-[150px] truncate mx-auto" title={inv.rejectionComment}>
                          Note: {inv.rejectionComment}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/app/invoice/${inv._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:border-slate-300"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        {(inv.status === 'NEEDS_CORRECTION' || inv.status === 'Needs Correction') && (
                          <Link
                            to={`/app/invoice/${inv._id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs transition hover:bg-amber-100"
                          >
                            <Wrench className="h-3.5 w-3.5 text-amber-700" />
                            <span>Fix & Resubmit</span>
                          </Link>
                        )}

                        {(inv.status === 'Rejected' || inv.status === 'DUPLICATE_SUBMISSION' || inv.status === 'ALREADY_PAID') && (
                          <button
                            onClick={() => handleDeleteInvoice(inv._id, inv.invoiceNumber)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-2xs transition hover:bg-rose-100"
                            title="Delete rejected invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span>Delete</span>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-600">
            <span>
              Page {currentPage} of {totalPages} ({filteredInvoices.length} Invoices)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
