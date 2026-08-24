import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, ArrowRight, Loader2, Layers, Clock } from 'lucide-react'
import api from '../../services/axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'

const fallbackSearchData = [
  { _id: 'INV-2026-0045', invoiceNumber: 'INV-2026-0045', vendorName: 'Spectrum Supplies Ltd', amount: 158200, currency: 'INR', status: 'Pending', invoiceDate: '2026-08-07' },
  { _id: 'INV-2026-0044', invoiceNumber: 'INV-2026-0044', vendorName: 'CloudScale Technologies', amount: 412000, currency: 'INR', status: 'Approved', invoiceDate: '2026-07-30' },
  { _id: 'INV-2026-0043', invoiceNumber: 'INV-2026-0043', vendorName: 'Apex Office Logistics', amount: 89500, currency: 'INR', status: 'Approved', invoiceDate: '2026-07-28' },
  { _id: 'INV-2026-0042', invoiceNumber: 'INV-2026-0042', vendorName: 'Nexus Software Corp', amount: 240000, currency: 'INR', status: 'NEEDS_CORRECTION', invoiceDate: '2026-07-26' },
  { _id: 'INV-2026-0041', invoiceNumber: 'INV-2026-0041', vendorName: 'Amazon Web Services', amount: 184300, currency: 'USD', status: 'DUPLICATE_RISK', invoiceDate: '2026-07-25' },
]

export function GlobalSearchModal({ isOpen, onClose, query = '', setQuery }) {
  const { user } = useAuth()
  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole.includes('manager')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isOpen) return
      setLoading(true)
      try {
        const res = await api.get('/invoices')
        let list = []
        if (res.data && Array.isArray(res.data.data?.invoices)) {
          list = res.data.data.invoices
        } else if (res.data && Array.isArray(res.data.data)) {
          list = res.data.data
        } else if (Array.isArray(res.data)) {
          list = res.data
        }
        setInvoices(list)
      } catch (err) {
        console.error('Failed to fetch invoices for global search:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const dataList = invoices.length > 0 ? invoices : fallbackSearchData

  // Sort invoices by date / createdAt descending so recent invoices come first
  const sortedData = [...dataList].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.invoiceDate || a.date || 0).getTime()
    const dateB = new Date(b.createdAt || b.invoiceDate || b.date || 0).getTime()
    return dateB - dateA
  })

  const trimmedQuery = (query || '').trim()
  const isSearching = trimmedQuery.length > 0

  const filtered = sortedData.filter((item) => {
    if (!isSearching) return true
    const q = trimmedQuery.toLowerCase()
    const invNo = (item.invoiceNumber || item._id || '').toLowerCase()
    const vendor = (item.vendorName || item.vendor || '').toLowerCase()
    const status = (item.status || '').toLowerCase()
    const cat = (item.category || '').toLowerCase()
    const amt = String(item.amount || item.totalAmount || '').toLowerCase()

    return invNo.includes(q) || vendor.includes(q) || status.includes(q) || cat.includes(q) || amt.includes(q)
  })

  // Show only recent 3 when empty search, and show all results when searching
  const displayedItems = isSearching ? filtered : filtered.slice(0, 3)

  // Determine section target based on invoice status and user role
  const getSectionTarget = (item) => {
    const s = (item.status || '').toUpperCase()
    const id = item._id || item.id

    if (s === 'PAID') {
      return { path: '/app/invoices', label: 'All Invoices', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    if (s === 'PAYMENT_QUEUE' || s === 'APPROVED') {
      return { path: '/app/payment-queue', label: 'Payment Queue', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (s === 'NEEDS_CORRECTION' || s === 'REJECTED') {
      return {
        path: isManager ? '/app/approval-queue' : `/app/invoices/${id}`,
        label: isManager ? 'Approval Queue' : 'Fix & Resubmit',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    }
    // Pending / Resubmitted / Duplicate Risk
    if (isManager) {
      return { path: '/app/approval-queue', label: 'Approval Queue', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    }
    return { path: '/app/sent-for-approval', label: 'Sent for Approval', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  }

  const handleSelect = (item) => {
    onClose()
    const target = getSectionTarget(item).path
    navigate(target)
  }

  // Quick navigation buttons to go directly to sections
  const sectionQuickLinks = isManager
    ? [
        { label: 'Approval Queue', path: '/app/approval-queue' },
        { label: 'Payment Queue', path: '/app/payment-queue' },
        { label: 'All Invoices', path: '/app/invoices' },
      ]
    : [
        { label: 'Sent for Approval', path: '/app/sent-for-approval' },
        { label: 'Payment Queue', path: '/app/payment-queue' },
        { label: 'All Invoices', path: '/app/invoices' },
      ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input Header */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery && setQuery(e.target.value)}
            placeholder="Search invoices by number, vendor, status, or amount..."
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {loading ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin mr-2" /> : null}
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section Quick Links */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Layers className="h-3 w-3 text-slate-400" /> Go to Section:
          </span>
          {sectionQuickLinks.map((sec) => (
            <button
              key={sec.label}
              onClick={() => {
                onClose()
                navigate(sec.path)
              }}
              className="rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs cursor-pointer"
            >
              {sec.label} →
            </button>
          ))}
        </div>

        {/* List Header Label */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            {isSearching ? (
              <>
                <Search className="h-3 w-3 text-blue-600" /> Search Results ({filtered.length} found)
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 text-slate-400" /> Recent Invoices (3 Most Recent)
              </>
            )}
          </span>
          {isSearching && (
            <button
              onClick={() => setQuery && setQuery('')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-4 pt-1 space-y-2">
          {displayedItems.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-9 w-9 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No matching invoices found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching by vendor name or invoice number</p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const target = getSectionTarget(item)
              const invId = item._id || item.id

              return (
                <div
                  key={invId}
                  onClick={() => handleSelect(item)}
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600 truncate">
                          #{item.invoiceNumber || invId}
                        </span>
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {item.vendorName || item.vendor || 'Vendor'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Amount:{' '}
                        <strong className="text-slate-900 font-extrabold">
                          {formatCurrency(item.amount || item.totalAmount || 0, item.currency)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Section Badge */}
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${target.color}`}>
                      {target.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                        navigate(`/app/invoices/${invId}`)
                      }}
                      className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
                      title="View Invoice Details"
                    >
                      Details
                    </button>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          <span>{isSearching ? `Showing all ${displayedItems.length} matching items` : 'Type in search bar to find more invoices'}</span>
          <span>Press <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 font-bold">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  )
}
