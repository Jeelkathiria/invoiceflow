import { Link } from 'react-router-dom'
import { FileText, ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react'

const statusBadges = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function RecentUploads({ liveInvoices = [] }) {
  const uploads = Array.isArray(liveInvoices) && liveInvoices.length > 0
    ? liveInvoices.slice(0, 5).map((inv) => ({
        id: inv._id,
        invoice: inv.invoiceNumber || 'INV-001',
        vendor: inv.vendorName || 'Unknown Vendor',
        amount: `₹${(inv.amount || inv.totalAmount || 0).toLocaleString('en-IN')}`,
        status: inv.status || 'Pending',
        uploaded: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'Today',
        duplicate: Boolean(inv.duplicate),
      }))
    : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Invoices Stream</p>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900">Recent Invoices Processed</h3>
        </div>

        <Link
          to="/app/invoices"
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <span>View Master Ledger</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
        <table className="min-w-full text-left text-xs text-slate-700 border-collapse">
          <thead className="border-b border-slate-200 bg-slate-100/80 font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {uploads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                  No recent invoice uploads recorded.
                </td>
              </tr>
            ) : (
              uploads.map((row) => (
                <tr key={row.id || row.invoice} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {row.invoice}
                    {row.duplicate && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-rose-50 border border-rose-200 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-700">
                        <AlertTriangle className="h-2.5 w-2.5" /> Duplicate
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.vendor}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${statusBadges[row.status] || statusBadges.Pending}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/app/invoice/${row.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
