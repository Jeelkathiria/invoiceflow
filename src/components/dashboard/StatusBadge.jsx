import { CheckCircle2, Clock, XCircle, CreditCard, RefreshCw } from 'lucide-react'

const statusStyles = {
  Approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'Payment Queue': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  PAYMENT_QUEUE: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  Paid: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold',
  PAID: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 border border-amber-200',
  Rejected: 'bg-red-100 text-red-700 border border-red-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  NEEDS_CORRECTION: 'bg-rose-100 text-rose-800 border border-rose-200',
  RESUBMITTED: 'bg-blue-100 text-blue-700 border border-blue-200',
  Overdue: 'bg-rose-100 text-rose-800 border border-rose-200',
  'Due Soon': 'bg-amber-100 text-amber-800 border border-amber-200',
  Scheduled: 'bg-blue-100 text-blue-700 border border-blue-200',
  Review: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export default function StatusBadge({ status }) {
  const displayLabel = status === 'PAYMENT_QUEUE' ? 'Payment Queue' : (status === 'PAID' || status === 'Paid') ? 'PAID' : status === 'PENDING_APPROVAL' ? 'Pending Approval' : status
  const isPaidOrApproved = status === 'PAID' || status === 'Paid' || status === 'Approved' || status === 'APPROVED'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
      {isPaidOrApproved && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />}
      {displayLabel}
    </span>
  );
}
