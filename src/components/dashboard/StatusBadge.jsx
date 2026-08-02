const statusStyles = {
  Approved: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700',
  Review: 'bg-slate-100 text-slate-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
