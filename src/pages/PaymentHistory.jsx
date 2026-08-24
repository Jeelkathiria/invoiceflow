import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/axios'
import { formatCurrency, calculateMultiCurrencyTotals } from '../utils/formatCurrency'
import {
  History,
  Search,
  CheckCircle2,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Loader2,
  DollarSign,
  Filter
} from 'lucide-react'

const ITEMS_PER_PAGE = 10

export function PaymentHistory() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // all, this_month, last_month
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPaymentHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invoices/payment-history', {
        params: { search: searchQuery, dateFilter }
      })
      let historyData = []
      if (res.data && res.data.data && Array.isArray(res.data.data.invoices)) {
        historyData = res.data.data.invoices
      } else if (res.data && Array.isArray(res.data.invoices)) {
        historyData = res.data.invoices
      }

      const mapped = historyData.map((inv) => ({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber || 'INV-001',
        vendorName: inv.vendorName || 'Unknown Vendor',
        category: inv.category || 'General Operations',
        amount: inv.amount || inv.totalAmount || 0,
        currency: inv.currency || 'INR',
        approvedBy: inv.approvedBy?.name || 'Finance Manager',
        paidBy:
          inv.paidBy?.name ||
          (typeof inv.paidBy === 'string' && !/^[0-9a-fA-F]{24}$/.test(inv.paidBy)
            ? inv.paidBy
            : 'Finance Executive'),
        paidAt: inv.paidAt ? new Date(inv.paidAt).toLocaleString() : inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : '-',
        rawPaidAt: inv.paidAt || inv.updatedAt,
        status: inv.status || 'PAID',
      }))

      setInvoices(mapped)
    } catch (err) {
      console.warn('[PaymentHistory] Error fetching history:', err)
      // Fallback if endpoint error
      try {
        const allRes = await api.get('/invoices')
        if (allRes.data && allRes.data.data && Array.isArray(allRes.data.data.invoices)) {
          const paidOnly = allRes.data.data.invoices.filter((i) => i.status === 'Paid' || i.status === 'PAID')
          const mapped = paidOnly.map((inv) => ({
            _id: inv._id,
            invoiceNumber: inv.invoiceNumber || 'INV-001',
            vendorName: inv.vendorName || 'Unknown Vendor',
            category: inv.category || 'General Operations',
            amount: inv.amount || inv.totalAmount || 0,
            currency: inv.currency || 'INR',
            approvedBy: inv.approvedBy?.name || 'Finance Manager',
            paidBy:
              inv.paidBy?.name ||
              (typeof inv.paidBy === 'string' && !/^[0-9a-fA-F]{24}$/.test(inv.paidBy)
                ? inv.paidBy
                : 'Finance Executive'),
            paidAt: inv.paidAt ? new Date(inv.paidAt).toLocaleString() : inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : '-',
            rawPaidAt: inv.paidAt || inv.updatedAt,
            status: inv.status || 'PAID',
          }))
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
    fetchPaymentHistory()
  }, [dateFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, dateFilter])

  // Local Search Filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      return (
        (item.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.paidBy || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [invoices, searchQuery])

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredInvoices, currentPage])

  // Totals
  const multiCurrencyTotals = useMemo(() => calculateMultiCurrencyTotals(invoices), [invoices])

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Payment History</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit trail log of all completed invoice disbursements and settled payments.
          </p>
        </div>

        {/* Paid Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-2 text-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700">Total Settled Payments</span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <p className="text-base font-black text-emerald-950">{multiCurrencyTotals.formattedInr}</p>
              <span className="rounded-md bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[11px] font-black text-emerald-800">
                {invoices.length} Settled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All History' },
            { id: 'this_month', label: 'Paid This Month' },
            { id: 'last_month', label: 'Last Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
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
            placeholder="Search vendor, invoice # or paid by..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Vendor & Category</th>
              <th className="py-3 px-4 text-right">Settled Amount</th>
              <th className="py-3 px-4">Approved By</th>
              <th className="py-3 px-4">Paid By (Finance)</th>
              <th className="py-3 px-4">Paid Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-bold">Fetching payment history...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  <ShieldCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No completed payments found.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Completed payments will automatically appear in this history log.</p>
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
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {row.paidBy}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 text-[11px]">
                    {row.paidAt}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3 stroke-[2.5]" /> Paid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/app/invoice/${row._id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-600" /> View Details
                    </Link>
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
              Page {currentPage} of {totalPages} ({filteredInvoices.length} total paid)
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
    </div>
  )
}
