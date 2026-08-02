import { X, Bell, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const notifications = [
  {
    id: 1,
    title: '3 Invoices Require Approval',
    desc: 'Spectrum Supplies & CloudScale invoices are waiting for final authorization.',
    time: '5m ago',
    type: 'warning',
    link: '/app/approval-queue'
  },
  {
    id: 2,
    title: 'Duplicate Invoice Warning',
    desc: 'Amazon Web Services INV-2026-0041 matches existing submission INV-2026-0012.',
    time: '25m ago',
    type: 'danger',
    link: '/app/invoices'
  },
  {
    id: 3,
    title: 'AI OCR Model Synchronized',
    desc: 'Ingestion accuracy updated to 99.4% with GST tax breakdown engine.',
    time: '2h ago',
    type: 'info',
    link: '/app'
  },
  {
    id: 4,
    title: 'Payment Scheduled',
    desc: 'Apex Office Logistics invoice ₹89,500 queued for settlement.',
    time: '4h ago',
    type: 'success',
    link: '/app/invoices'
  }
]

export function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 light:border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white light:text-slate-900">Notifications</h2>
                  <p className="text-xs text-slate-400 light:text-slate-500">4 unread operational alerts</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-slate-400 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notification List */}
            <div className="mt-6 space-y-3.5">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose()
                    navigate(item.link)
                  }}
                  className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:border-indigo-500/40 hover:bg-slate-800/60 transition cursor-pointer light:border-slate-200 light:bg-slate-50 light:hover:bg-indigo-50/60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                      {item.type === 'danger' && <ShieldAlert className="h-4 w-4 text-rose-400" />}
                      {item.type === 'info' && <Sparkles className="h-4 w-4 text-indigo-400" />}
                      {item.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      <span className="text-xs font-bold text-white light:text-slate-900">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{item.time}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 light:text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-800 pt-4 light:border-slate-200">
            <button
              onClick={() => {
                onClose()
                navigate('/app/approval-queue')
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition hover:bg-indigo-500"
            >
              <span>View All Approvals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
