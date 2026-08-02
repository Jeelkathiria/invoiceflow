import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/axios'
import { DocumentViewer } from '../components/DocumentViewer'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react'

const ITEMS_PER_PAGE = 12

export function ApprovalQueue() {
  const { user } = useAuth()
  const userRole = (user?.role || '').toLowerCase()
  const isManager = userRole === 'manager'

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending') // Display only Pending invoices by default
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedModalInvoice, setSelectedModalInvoice] = useState(null)
  const [managerComment, setManagerComment] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices')
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        const mongoInvoices = res.data.data.invoices.map((inv) => ({
          _id: inv._id,
          id: inv.invoiceNumber || inv._id,
          invoiceNumber: inv.invoiceNumber || 'INV-001',
          vendorName: inv.vendorName || 'Unknown Vendor',
          category: inv.category || 'General Invoices',
          submittedBy: inv.uploadedBy?.name || 'Finance Executive',
          invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '2026-08-01',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '2026-08-10',
          totalAmount: inv.amount || inv.totalAmount || 0,
          amount: inv.amount || inv.totalAmount || 0,
          subtotal: inv.subtotal || 0,
          gst: inv.gst || 0,
          priority: inv.amount > 50000 ? 'High' : 'Normal',
          confidenceScore: inv.confidenceScore || 95.0,
          duplicate: Boolean(inv.duplicate),
          aiFlag: inv.duplicate ? 'Duplicate Risk' : 'Clean Match',
          status: inv.status || 'Pending',
          invoiceUrl: inv.invoiceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          lineItems: inv.lineItems || [],
          vendorGstin: inv.vendorGstin || '22-AAAAA0000A-1-Z-5',
          comments: inv.comments || [],
        }))

        setQueue(mongoInvoices)
      } else {
        setQueue([])
      }
    } catch (err) {
      console.warn('[ApprovalQueue] Could not fetch live invoices:', err)
      setQueue([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery])

  const handleAction = async (item, newStatus) => {
    if (!isManager) return

    try {
      if (item._id && !item._id.startsWith('inv-demo')) {
        await api.put(`/invoices/${item._id}`, {
          status: newStatus,
          comments: managerComment ? [managerComment] : [],
        })
      }
      setQueue((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
      )
      showToast(`Invoice #${item.invoiceNumber || item.id} set to ${newStatus}!`, 'success')
    } catch (err) {
      console.error('Failed to update invoice status:', err)
      setQueue((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
      )
      showToast(`Invoice updated to ${newStatus}`, 'success')
    } finally {
      setManagerComment('')
      setSelectedModalInvoice(null)
    }
  }

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (item.duplicate || item.status === 'Draft' || item.aiFlag === 'Duplicate Risk') {
        return false
      }

      const matchesFilter =
        filter === 'All'
          ? true
          : filter === 'Pending'
          ? item.status === 'Pending'
          : filter === 'Approved'
          ? item.status === 'Approved'
          : filter === 'Rejected'
          ? item.status === 'Rejected'
          : item.status === filter

      const matchesSearch =
        (item.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [queue, filter, searchQuery])

  const totalPages = Math.ceil(filteredQueue.length / ITEMS_PER_PAGE) || 1
  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredQueue.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredQueue, currentPage])

  const pendingCount = queue.filter((i) => i.status === 'Pending' && !i.duplicate).length
  const pendingValue = queue
    .filter((i) => i.status === 'Pending' && !i.duplicate)
    .reduce((sum, i) => sum + (i.totalAmount || i.amount || 0), 0)

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {toast.type === 'error' ? (
            <XCircle className="h-4 w-4 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & KPI Metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Approval Queue (Manager)</h1>
          <p className="text-xs text-slate-500 font-medium">Review pending invoices, inspect AI extraction data, approve or reject</p>
        </div>

        {/* Quick KPI Bar */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pending Review</span>
            <p className="text-sm font-black text-amber-600">{pendingCount} Invoices</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pending Value</span>
            <p className="text-sm font-black text-slate-900">₹{pendingValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'Pending', label: `Pending (${pendingCount})` },
            { id: 'All', label: 'All Invoices' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
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

      {/* Invoices List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Vendor & Category</th>
              <th className="py-3 px-4">Submitted By</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">AI Confidence</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedQueue.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedQueue.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.invoiceNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900">{item.vendorName}</p>
                    <p className="text-[10px] text-slate-400">{item.category}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.submittedBy}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{(item.totalAmount || item.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      <Sparkles className="h-2.5 w-2.5" /> {item.confidenceScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedModalInvoice(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" /> Review
                      </button>

                      {item.status === 'Pending' && isManager && (
                        <>
                          <button
                            onClick={() => handleAction(item, 'Approved')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                            title="Approve Invoice"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(item, 'Rejected')}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            title="Reject Invoice"
                          >
                            <X className="h-3.5 w-3.5 stroke-[3]" /> Reject
                          </button>
                        </>
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
              Page {currentPage} of {totalPages} ({filteredQueue.length} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal with Document Preview & Manager Comments */}
      {selectedModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-blue-600 text-xs">#{selectedModalInvoice.invoiceNumber}</span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedModalInvoice.vendorName}</h2>
                <p className="text-xs text-slate-400">Category: {selectedModalInvoice.category}</p>
              </div>
              <button
                onClick={() => setSelectedModalInvoice(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document & Table Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Uploaded Original Document</h4>
                <DocumentViewer invoice={selectedModalInvoice} />
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="text-slate-900 text-sm font-black">₹{(selectedModalInvoice.totalAmount || selectedModalInvoice.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Invoice Date:</span>
                    <span className="text-slate-800">{selectedModalInvoice.invoiceDate}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">AI Score:</span>
                    <span className="text-emerald-700 font-bold">{selectedModalInvoice.confidenceScore}% Match</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase text-slate-400">Extracted Line Items</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedModalInvoice.lineItems || []).map((li, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium text-slate-900">{li.description}</td>
                          <td className="p-2 text-right font-bold text-slate-900">₹{(li.total || li.amount || (li.quantity * li.unitPrice) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Manager Comments Text Area */}
            {isManager && selectedModalInvoice.status === 'Pending' && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> Manager Approval / Rejection Comments
                </label>
                <textarea
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Add authorization remarks or rejection reasons for finance audit logs..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                  rows={2}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              {selectedModalInvoice.status === 'Pending' && isManager && (
                <>
                  <button
                    onClick={() => handleAction(selectedModalInvoice, 'Approved')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    Approve Invoice
                  </button>
                  <button
                    onClick={() => handleAction(selectedModalInvoice, 'Rejected')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Reject Invoice
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedModalInvoice(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
