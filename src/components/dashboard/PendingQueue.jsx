import { Link } from 'react-router-dom'
import { ListChecks, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

const priorityBadge = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function PendingQueue({ liveInvoices = [] }) {
  const pendingInvoices = Array.isArray(liveInvoices) && liveInvoices.length > 0
    ? liveInvoices
        .filter((inv) => inv.status === 'Pending' && !inv.duplicate)
        .slice(0, 4)
        .map((inv) => ({
          id: inv._id,
          invoice: inv.invoiceNumber || 'INV-001',
          vendor: inv.vendorName || 'Unknown Vendor',
          amount: formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency),
          submittedBy: 'Finance Executive',
          priority: (inv.amount || 0) > 100000 ? 'High' : (inv.amount || 0) > 40000 ? 'Medium' : 'Low',
        }))
    : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ListChecks className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Approval Queue ({pendingInvoices.length})</p>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900">Invoices Awaiting Action</h3>
        </div>

        <Link
          to="/app/approval-queue"
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span>Open Full Queue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {pendingInvoices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            Queue is clean! No invoices awaiting action.
          </div>
        ) : (
          pendingInvoices.map((item) => (
            <div
              key={item.id || item.invoice}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600">{item.invoice}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${priorityBadge[item.priority] || priorityBadge.Medium}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-900">{item.vendor}</p>
                <p className="text-[11px] text-slate-500">Submitted by {item.submittedBy}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-xs font-bold text-slate-900">{item.amount}</span>
                <Link
                  to={`/app/invoice/${item.id}`}
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                >
                  Review
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
