import { useState, useEffect } from 'react'
import {
  X,
  AlertCircle,
  Wrench,
  Copy,
  CheckCircle2,
  Search,
  Check,
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

  const searchLower = invoiceSearchQuery.toLowerCase()
  const filteredInvoices = availableInvoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchLower) ||
      (inv.vendorName || '').toLowerCase().includes(searchLower)

    if (selectedReason === 'ALREADY_PAID') {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden my-8">
        
        {/* Simple & Clean Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Reject Invoice
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Select a reason and details for processing rejection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-slate-900 text-white p-3 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Invoice Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Target Invoice</span>
              <p className="font-bold text-slate-900">
                {invoice.invoiceNumber || 'INV-001'}{' '}
                <span className="font-normal text-slate-500">— {invoice.vendorName}</span>
              </p>
            </div>
            <p className="font-bold text-sm text-slate-900">
              {formatCurrency(invoice.amount || invoice.totalAmount || 0, invoice.currency)}
            </p>
          </div>

          {/* Selectable Reason Options */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Rejection Reason
            </label>

            <div className="space-y-2">
              {/* Option 1: Correction Required */}
              <div
                onClick={() => {
                  setSelectedReason('CORRECTION_REQUIRED')
                  setErrorMsg('')
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedReason === 'CORRECTION_REQUIRED'
                    ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                    selectedReason === 'CORRECTION_REQUIRED'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Correction Required</h3>
                    {selectedReason === 'CORRECTION_REQUIRED' && (
                      <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Invoice contains incorrect or missing information to be corrected by Finance.
                  </p>
                </div>
              </div>

              {/* Option 2: Already Submitted */}
              <div
                onClick={() => {
                  setSelectedReason('ALREADY_SUBMITTED')
                  setErrorMsg('')
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedReason === 'ALREADY_SUBMITTED'
                    ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                    selectedReason === 'ALREADY_SUBMITTED'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Already Submitted</h3>
                    {selectedReason === 'ALREADY_SUBMITTED' && (
                      <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    This invoice has already been submitted under another record.
                  </p>
                </div>
              </div>

              {/* Option 3: Already Paid */}
              <div
                onClick={() => {
                  setSelectedReason('ALREADY_PAID')
                  setErrorMsg('')
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedReason === 'ALREADY_PAID'
                    ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                    selectedReason === 'ALREADY_PAID'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Already Paid</h3>
                    {selectedReason === 'ALREADY_PAID' && (
                      <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Payment has already been processed for this bill.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Form Fields */}
          {selectedReason === 'CORRECTION_REQUIRED' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Correction Notes <span className="text-slate-900">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Specify what needs to be fixed..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition resize-none font-medium"
              />
            </div>
          )}

          {(selectedReason === 'ALREADY_SUBMITTED' || selectedReason === 'ALREADY_PAID') && (
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {selectedReason === 'ALREADY_PAID' ? 'Related Paid Invoice *' : 'Related Invoice *'}
              </label>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  placeholder="Search invoice number, vendor..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Invoices Selection List */}
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {isLoadingInvoices ? (
                  <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-700" />
                    <span>Loading invoices...</span>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching invoices found.
                  </div>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isSelected = selectedRelatedInvoice?._id === inv._id
                    return (
                      <div
                        key={inv._id}
                        onClick={() => setSelectedRelatedInvoice(inv)}
                        className={`p-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer transition ${
                          isSelected ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className={`h-3.5 w-3.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                          <div>
                            <p className="font-bold text-slate-900">{inv.invoiceNumber || 'INV-000'}</p>
                            <p className="text-[10px] text-slate-500">{inv.vendorName || 'Unknown Vendor'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <p className="font-bold text-slate-900">
                            {formatCurrency(inv.amount || inv.totalAmount || 0, inv.currency)}
                          </p>
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {selectedRelatedInvoice && (
                <div className="rounded-xl bg-slate-100 border border-slate-200 p-2.5 text-xs text-slate-800 space-y-0.5">
                  <p className="font-bold">Selected Reference:</p>
                  <p className="text-[11px] text-slate-600">
                    {selectedRelatedInvoice.invoiceNumber} — {selectedRelatedInvoice.vendorName} —{' '}
                    {formatCurrency(selectedRelatedInvoice.amount, selectedRelatedInvoice.currency)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Clean Neutral Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : selectedReason === 'CORRECTION_REQUIRED' ? (
                <span>Send for Correction</span>
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
