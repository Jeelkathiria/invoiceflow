import { useMemo } from 'react'
import { Activity, CheckCircle, FilePlus, XCircle, ShieldCheck } from 'lucide-react'

export function ActivityTimeline({ liveInvoices = [] }) {
  const timeline = useMemo(() => {
    if (!Array.isArray(liveInvoices) || liveInvoices.length === 0) return []

    return liveInvoices.slice(0, 4).map((inv) => {
      const isApproved = inv.status === 'Approved'
      const isRejected = inv.status === 'Rejected'
      const uploader = inv.uploadedBy?.name || 'Finance Exec'
      const invNo = inv.invoiceNumber || 'Invoice'

      let icon = FilePlus
      let color = 'text-blue-600 bg-blue-50'
      let action = `uploaded ${invNo} (${inv.vendorName || 'Vendor'})`

      if (isApproved) {
        icon = CheckCircle
        color = 'text-emerald-600 bg-emerald-50'
        action = `approved ${invNo} (₹${(inv.amount || 0).toLocaleString('en-IN')})`
      } else if (isRejected) {
        icon = XCircle
        color = 'text-rose-600 bg-rose-50'
        action = `rejected ${invNo}`
      }

      return {
        actor: uploader,
        action,
        time: inv.createdAt ? new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        icon,
        color,
      }
    })
  }, [liveInvoices])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Activity className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Activity Log</p>
      </div>
      <h3 className="mt-1 text-base font-bold text-slate-900">Recent Audit Trail</h3>

      <div className="mt-4 space-y-2.5">
        {timeline.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-6 w-6 text-slate-400 mx-auto mb-1" />
            No recent activity recorded yet.
          </div>
        ) : (
          timeline.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:bg-slate-50">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  <span className="font-bold text-blue-600">{item.actor}</span> {item.action}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-400">{item.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
