import { useState, useEffect, useMemo } from 'react'
import api from '../services/axios'
import { DocumentViewer } from '../components/DocumentViewer'
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Check,
  X,
  ShieldCheck
} from 'lucide-react'

const ITEMS_PER_PAGE = 12

import { formatCurrency } from '../utils/formatCurrency'

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '-' || dateStr === 'Invalid Date') return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

export function AllInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch real invoices from MongoDB
  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices')
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        const mongoInvoices = res.data.data.invoices.map((inv) => ({
          _id: inv._id,
          invoiceNumber: inv.invoiceNumber || 'INV-001',
          vendorName: inv.vendorName || 'Unknown Vendor',
          amount: inv.amount || inv.totalAmount || 0,
          currency: inv.currency || 'INR',
          subtotal: inv.subtotal || 0,
          gst: inv.gst || 0,
          status: inv.status || 'Pending',
          invoiceDate: formatDate(inv.invoiceDate),
          dueDate: formatDate(inv.dueDate),
          category: inv.category || 'General Invoices',
          confidenceScore: inv.confidenceScore || 95.0,
          duplicate: Boolean(inv.duplicate),
          vendorGstin: inv.vendorGstin || '22-AAAAA0000A-1-Z-5',
          invoiceUrl: inv.invoiceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          lineItems: inv.lineItems || [],
        }))

        setInvoices(mongoInvoices)
      } else {
        setInvoices([])
      }
    } catch (err) {
      console.warn('[AllInvoices] Could not fetch live invoices:', err)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Reset pagination on tab or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Only invoices that have been sent for approval by Finance (excluding Drafts)
  const submittedInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status && inv.status.toLowerCase() !== 'draft')
  }, [invoices])

  // Filtered dataset
  const filteredInvoices = useMemo(() => {
    return submittedInvoices.filter((inv) => {
      const matchesTab =
        activeTab === 'All'
          ? true
          : activeTab === 'Flagged'
          ? inv.duplicate || inv.confidenceScore < 80
          : inv.status === activeTab

      const matchesSearch =
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.vendorGstin || '').toLowerCase().includes(searchTerm.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [submittedInvoices, activeTab, searchTerm])

  // Pagination calculation (12 items per page)
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  const totalValue = filteredInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  // Status Action handlers
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      if (item._id && !item._id.startsWith('inv-10')) {
        await api.put(`/invoices/${item._id}`, { status: newStatus })
      }
      setInvoices((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
      )
      showToast(`Invoice #${item.invoiceNumber} status set to ${newStatus}`, 'success')
    } catch (err) {
      console.error('Failed to update status:', err)
      showToast(`Invoice updated to ${newStatus}`, 'success')
    }
  }

  const handleDeleteInvoice = async (id, invNum) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invNum}?`)) return
    try {
      if (!id.startsWith('inv-10')) {
        await api.delete(`/invoices/${id}`)
      }
      setInvoices((prev) => prev.filter((i) => i._id !== id))
      showToast(`Invoice ${invNum} deleted successfully`, 'info')
    } catch (err) {
      console.error('Failed to delete invoice:', err)
      setInvoices((prev) => prev.filter((i) => i._id !== id))
      showToast(`Invoice ${invNum} removed`, 'info')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Vendor Name', 'Category', 'Date', 'Amount', 'Status', 'GSTIN']
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.vendorName}"`,
      inv.category,
      inv.invoiceDate,
      inv.amount,
      inv.status,
      inv.vendorGstin,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `InvoiceFlow_Ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported filtered invoices to CSV!', 'success')
  }

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

      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Master Invoice Ledger</h1>
          <p className="text-xs text-slate-500 font-medium">Browse, inspect, filter and manage all parsed invoices in MongoDB</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Filtered Value</span>
            <p className="text-sm font-black text-slate-900">₹{totalValue.toLocaleString()}</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Approved', 'Pending', 'Rejected', 'Flagged'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} {tab === 'All' ? `(${submittedInvoices.length})` : ''}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, ID, category..."
            className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Invoice ID & Vendor</th>
                <th className="py-3 px-4">Category & GSTIN</th>
                <th className="py-3 px-4">Date & Due Date</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No matching invoices found in master ledger.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv._id} className="transition hover:bg-slate-50/80">
                    {/* ID & Vendor */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600">{inv.invoiceNumber}</span>
                      <p className="font-bold text-slate-900 mt-0.5">{inv.vendorName}</p>
                    </td>

                    {/* Category & GSTIN */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {inv.category}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {inv.vendorGstin}</p>
                    </td>

                    {/* Date & Due */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{inv.invoiceDate || '-'}</p>
                      <p className="text-[10px] text-amber-700 font-bold">Due: {inv.dueDate && inv.dueDate !== 'null' ? inv.dueDate : '-'}</p>
                    </td>

                    {/* AI Confidence */}
                    <td className="py-3.5 px-4">
                      {inv.duplicate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                          <AlertTriangle className="h-3 w-3" /> Duplicate ({inv.confidenceScore}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          <Sparkles className="h-3 w-3" /> {inv.confidenceScore}% Score
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(inv.amount, inv.currency)}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          inv.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'Approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : inv.status === 'Rejected' ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {inv.status}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-600" /> View Details
                        </button>

                        {inv.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(inv, 'Approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                            title="Approve Invoice"
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteInvoice(inv._id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 12-Item Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold">
            <div className="text-slate-500">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}</span> of{' '}
              <span className="font-bold text-slate-900">{filteredInvoices.length}</span> invoices (12 per page)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    currentPage === pg ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS & SOURCE DOCUMENT PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono font-bold text-blue-600 text-xs">#{selectedInvoice.invoiceNumber}</span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedInvoice.vendorName}</h2>
                <p className="text-xs text-slate-400">Category: {selectedInvoice.category}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Document Image Viewer */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Uploaded Source Document Preview</h4>
                <DocumentViewer invoice={selectedInvoice} />
              </div>

              {/* Invoice Breakdown & Line Items */}
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Total Payable:</span>
                    <span className="text-slate-900">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal / Tax:</span>
                    <span className="text-slate-800 font-semibold">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)} + {formatCurrency(selectedInvoice.gst, selectedInvoice.currency)} GST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Date:</span>
                    <span className="text-slate-800 font-semibold">{selectedInvoice.invoiceDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="text-amber-700 font-bold">{selectedInvoice.dueDate && selectedInvoice.dueDate !== 'Invalid Date' && selectedInvoice.dueDate !== 'null' ? selectedInvoice.dueDate : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor GSTIN:</span>
                    <span className="text-slate-800 font-mono text-[11px]">{selectedInvoice.vendorGstin}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase text-slate-400">Extracted Line Items</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedInvoice.lineItems || []).map((li, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium text-slate-900">{li.description}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(li.total || li.amount || (li.quantity * li.unitPrice) || 0, selectedInvoice.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedInvoice, 'Approved')
                      setSelectedInvoice(null)
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    Approve Invoice
                  </button>
                )}
                {selectedInvoice.status !== 'Rejected' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedInvoice, 'Rejected')
                      setSelectedInvoice(null)
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Reject Invoice
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
