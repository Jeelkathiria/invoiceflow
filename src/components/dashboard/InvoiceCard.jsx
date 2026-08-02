import StatusBadge from './StatusBadge.jsx';

export default function InvoiceCard({ invoice }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{invoice.number}</p>
          <p className="mt-2 text-sm text-slate-500">{invoice.vendor}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{invoice.amount}</p>
          <StatusBadge status={invoice.status} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{invoice.dueDate}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <span>{invoice.uploadedBy}</span>
      </div>
    </div>
  );
}
