import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export function ApproveInvoiceModal({ isOpen, onClose, invoice, onConfirm }) {
  const [managerComment, setManagerComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setManagerComment('')
      setErrorMsg('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen || !invoice) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      await onConfirm(managerComment.trim())
      onClose()
    } catch (err) {
      console.error('Approval error:', err)
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to approve invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const invoiceNum = invoice.invoiceNumber || invoice.id || 'INV-001'
  const vendor = invoice.vendorName || 'Unknown Vendor'
  const amt = invoice.amount || invoice.totalAmount || 0
  const curr = invoice.currency || 'INR'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all scale-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-emerald-50/80 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Confirm Invoice Approval</h2>
              <p className="text-xs text-slate-500 font-medium">Manager Authorization Signoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Question Prompt */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
            <p className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Are you sure you want to approve this invoice?
            </p>
            <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
              Once approved, invoice <span className="font-mono font-bold">{invoiceNum}</span> will be released to the Finance Payment Queue for disbursement.
            </p>
          </div>

          {/* Target Invoice Details Summary Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
              <span>Invoice Details</span>
              <span className="font-mono text-blue-600">#{invoiceNum}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="text-slate-500 font-semibold">Vendor Name</span>
              <span className="font-extrabold text-slate-900">{vendor}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Total Amount</span>
              <span className="font-black text-sm text-slate-900">
                {formatCurrency(amt, curr)}
              </span>
            </div>

            {invoice.confidenceScore && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">AI Extraction Score</span>
                <span className="font-extrabold text-emerald-700">{invoice.confidenceScore}% Match</span>
              </div>
            )}
          </div>

          {/* Optional Manager Authorization Remarks */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-extrabold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                Manager Remarks (Optional)
              </span>
              <span className="text-[10px] font-normal text-slate-400">Recorded in audit log</span>
            </label>
            <textarea
              rows={2}
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Add optional approval remarks or signoff notes..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
