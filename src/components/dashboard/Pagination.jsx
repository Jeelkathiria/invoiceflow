import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPrevious, onNext }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
      <div className="font-medium text-slate-900">Page {page} of {totalPages}</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
