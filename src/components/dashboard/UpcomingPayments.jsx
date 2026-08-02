import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, AlertCircle, Eye, CheckCircle2, ShieldCheck } from 'lucide-react'

export function UpcomingPayments({ liveInvoices = [] }) {
  const navigate = useNavigate()

  const items = useMemo(() => {
    if (!Array.isArray(liveInvoices) || liveInvoices.length === 0) return []
    return liveInvoices.slice(0, 3).map((inv) => ({
      id: inv._id,
      invoiceNumber: inv.invoiceNumber || 'INV-001',
      vendor: inv.vendorName || 'Unknown Vendor',
      due: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'Upcoming',
      amount: `₹${(inv.amount || inv.totalAmount || 0).toLocaleString('en-IN')}`,
      remaining: inv.status === 'Approved' ? 'Ready for ERP' : 'Pending Review',
      ready: inv.status === 'Approved',
    }))
  }, [liveInvoices])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Calendar className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Payments</p>
      </div>
      <h3 className="mt-1 text-base font-bold text-slate-900">Payments Due Soon</h3>

      <div className="mt-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            No upcoming payments due.
          </div>
        ) : (
          items.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-600 text-xs">
                  {row.vendor[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{row.vendor}</p>
                  <p className="text-xs font-bold text-blue-600">
                    {row.amount} • <span className="font-mono text-slate-500">{row.invoiceNumber}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold text-amber-700 text-[11px]">
                  <AlertCircle className="h-3 w-3" />
                  {row.remaining}
                </span>

                <button
                  onClick={() => navigate(`/app/invoice/${row.id}`)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
