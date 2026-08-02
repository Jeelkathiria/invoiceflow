import { FileText, Plus, Search, CheckCircle2 } from 'lucide-react'

export function EmptyState({ 
  icon: Icon = FileText, 
  title = "No invoices found", 
  description = "No invoices uploaded yet. Upload your first invoice to let AI extract and organize the data.",
  actionLabel = "Upload Invoice",
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 light:border-slate-300 light:bg-slate-50/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-soft">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-white light:text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-slate-400 light:text-slate-500 leading-relaxed">{description}</p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-indigo-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
