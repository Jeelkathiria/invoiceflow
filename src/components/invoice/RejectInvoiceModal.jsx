import { useState, useEffect } from 'react'
import {
  X,
  AlertTriangle,
  Wrench,
  Copy,
  CheckCircle2,
  Search,
  Check,
  HelpCircle,
  Loader2,
  FileText,
} from 'lucide-react'
import api from '../../services/axios'
import { formatCurrency } from '../../utils/formatCurrency'

export function RejectInvoiceModal({ isOpen, onClose, invoice, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState('CORRECTION_REQUIRED')
  const [correctionNotes, setCorrectionNotes] = useState('')
  const [selectedRelatedInvoice, setSelectedRelatedInvoice] = useState(null)
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [availableInvoices, setAvailableInvoices] = useState([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch available invoices for selection when search query or mode changes
  useEffect(() => {
    if (!isOpen) return

    const fetchInvoices = async () => {
      setIsLoadingInvoices(true)
      try {
        const res = await api.get('/invoices?limit=100')
        if (res.data?.success && Array.isArray(res.data?.data?.invoices)) {
          const filtered = res.data.data.invoices.filter((inv) => inv._id !== invoice?._id)
          setAvailableInvoices(filtered)
        }
      } catch (err) {
        console.warn('Failed to fetch invoices for related invoice selection:', err.message)
      } finally {
        setIsLoadingInvoices(false)
      }
    }

    fetchInvoices()
  }, [isOpen, invoice?._id])

  if (!isOpen || !invoice) return null

  // Filter invoices for selection based on selected reason and search query
  const searchLower = invoiceSearchQuery.toLowerCase()
  const filteredInvoices = availableInvoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchLower) ||
      (inv.vendorName || '').toLowerCase().includes(searchLower)

    if (selectedReason === 'ALREADY_PAID') {
      // Prioritize or filter paid / approved invoices for Already Paid
      return matchesSearch && (inv.status === 'Paid' || inv.status === 'PAID' || inv.status === 'Approved' || inv.status === 'PAYMENT_QUEUE')
    }
    return matchesSearch
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (selectedReason === 'CORRECTION_REQUIRED' && !correctionNotes.trim()) {
      setErrorMsg('Please provide Correction Notes explaining what needs to be fixed.')
      return
    }

    if ((selectedReason === 'ALREADY_SUBMITTED' || selectedReason === 'ALREADY_PAID') && !selectedRelatedInvoice) {
      setErrorMsg(`Please select the existing ${selectedReason === 'ALREADY_PAID' ? 'paid' : 'submitted'} invoice.`)
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm({
        rejectionReason: selectedReason,
        rejectionComment: correctionNotes.trim() || (selectedReason === 'ALREADY_SUBMITTED' ? 'Already submitted through another invoice.' : 'Invoice payment already exists.'),
        relatedInvoiceId: selectedRelatedInvoice?._id || null,
      })
      onClose()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit rejection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-rose-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-extrabold shadow-2xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Reject Invoice</h2>
              <p className="text-xs text-slate-500 font-medium">Select a reason for rejection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
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

          {/* Current Invoice Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Target Invoice</span>
              <p className="font-extrabold text-slate-900">
                {invoice.invoiceNumber || 'INV-001'}{' '}
                <span className="font-normal text-slate-500">— {invoice.vendorName}</span>
              </p>
            </div>
            <p className="font-black text-sm text-slate-900">
              {formatCurrency(invoice.amount || invoice.totalAmount || 0, invoice.currency)}
            </p>
          </div>

          {/* Selectable Reason Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block">Select Rejection Reason</label>

            <div className="grid grid-cols-1 gap-3">
              {/* Option 1: Correction Required */}
              <div
                onClick={() => {
                  setSelectedReason('CORRECTION_REQUIRED')
                  setErrorMsg('')
                }}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  selectedReason === 'CORRECTION_REQUIRED'
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                    selectedReason === 'CORRECTION_REQUIRED'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900">🔧 Correction Required</h3>
                    {selectedReason === 'CORRECTION_REQUIRED' && (
                      <CheckCircle2 className="h-4 w-4 text-amber-600 fill-amber-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Invoice contains incorrect or missing information.
                  </p>
                </div>
              </div>

              {/* Option 2: Already Submitted */}
              <div
                onClick={() => {
                  setSelectedReason('ALREADY_SUBMITTED')
                  setErrorMsg('')
                }}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  selectedReason === 'ALREADY_SUBMITTED'
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                    selectedReason === 'ALREADY_SUBMITTED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900">📄 Already Submitted</h3>
                    {selectedReason === 'ALREADY_SUBMITTED' && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    This invoice has already been submitted by another Finance user.
                  </p>
                </div>
              </div>

              {/* Option 3: Already Paid */}
              <div
                onClick={() => {
                  setSelectedReason('ALREADY_PAID')
                  setErrorMsg('')
                }}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                  selectedReason === 'ALREADY_PAID'
                    ? 'border-purple-500 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                    selectedReason === 'ALREADY_PAID'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900">💰 Already Paid</h3>
                    {selectedReason === 'ALREADY_PAID' && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 fill-purple-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    This invoice has already been paid.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM FIELDS */}

          {/* 1. CORRECTION REQUIRED: Textarea for Correction Notes */}
          {selectedReason === 'CORRECTION_REQUIRED' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>Correction Notes *</span>
                <span className="text-[10px] text-slate-400 font-normal">Explains what needs to be fixed</span>
              </label>
              <textarea
                rows={3}
                required
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Explain what needs to be corrected... E.g., Invoice amount does not match the attached document."
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:outline-none transition resize-none"
              />
            </div>
          )}

          {/* 2 & 3. ALREADY SUBMITTED / ALREADY PAID: Related Invoice Combobox Search */}
          {(selectedReason === 'ALREADY_SUBMITTED' || selectedReason === 'ALREADY_PAID') && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>
                  {selectedReason === 'ALREADY_PAID' ? 'Related Paid Invoice *' : 'Related Invoice *'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Select existing record</span>
              </label>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  placeholder="Search invoice number, vendor name..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>

              {/* Invoices Selection List */}
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
                {isLoadingInvoices ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Loading existing invoices...</span>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching invoices found in MongoDB database.
                  </div>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isSelected = selectedRelatedInvoice?._id === inv._id
                    return (
                      <div
                        key={inv._id}
                        onClick={() => setSelectedRelatedInvoice(inv)}
                        className={`p-3 flex items-center justify-between gap-3 text-xs cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/70 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div>
                            <p className="font-extrabold text-slate-900">{inv.invoiceNumber || 'INV-000'}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{inv.vendorName || 'Unknown Vendor'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="font-black text-slate-900">
                              {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                            </p>
                            <span className="text-[9px] uppercase font-extrabold text-slate-500">
                              {inv.status || 'Pending'}
                            </span>
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Confirmation Confirmation Callout when Invoice Selected */}
              {selectedRelatedInvoice && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1">
                  <p className="font-extrabold">
                    Are you sure this invoice is already {selectedReason === 'ALREADY_PAID' ? 'paid' : 'submitted'}?
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Selected:{' '}
                    <strong>
                      {selectedRelatedInvoice.invoiceNumber} — {selectedRelatedInvoice.vendorName} —{' '}
                      {formatCurrency(selectedRelatedInvoice.amount, selectedRelatedInvoice.currency)}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-rose-500/25 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Rejection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
