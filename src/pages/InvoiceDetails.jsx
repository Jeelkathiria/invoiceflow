import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/axios'
import { DocumentViewer } from '../components/DocumentViewer'
import {
  ArrowLeft,
  Printer,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Send,
  MessageSquare,
  Loader2,
  Building2,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  History,
  RotateCcw,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
} from 'lucide-react'

import { formatCurrency } from '../utils/formatCurrency'
import { RejectInvoiceModal } from '../components/invoice/RejectInvoiceModal'
import { ApproveInvoiceModal } from '../components/invoice/ApproveInvoiceModal'

export function InvoiceDetails() {
  const { user } = useAuth()
  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole.includes('manager')
  const isFinance = userRole.includes('finance') || !isManager

  const { invoiceId } = useParams()
  const navigate = useNavigate()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Pending')
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false)
  const [markPaidLoading, setMarkPaidLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // FIX & RESUBMIT INLINE EDITING STATE
  const [isEditing, setIsEditing] = useState(false)
  const [resubmitLoading, setResubmitLoading] = useState(false)
  const [resubmitError, setResubmitError] = useState('')

  const [formVendorName, setFormVendorName] = useState('')
  const [formVendorGstin, setFormVendorGstin] = useState('')
  const [formVendorEmail, setFormVendorEmail] = useState('')
  const [formVendorAddress, setFormVendorAddress] = useState('')
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('')
  const [formInvoiceDate, setFormInvoiceDate] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formCurrency, setFormCurrency] = useState('INR')
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30')
  const [formNotes, setFormNotes] = useState('')

  const [formSubtotal, setFormSubtotal] = useState(0)
  const [formGst, setFormGst] = useState(0)
  const [formCgst, setFormCgst] = useState(0)
  const [formSgst, setFormSgst] = useState(0)
  const [formIgst, setFormIgst] = useState(0)
  const [formDiscount, setFormDiscount] = useState(0)
  const [formGrandTotal, setFormGrandTotal] = useState(0)

  const [formLineItems, setFormLineItems] = useState([])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch invoice details from MongoDB
  const fetchInvoiceData = async () => {
    if (!invoiceId) return
    setLoading(true)
    try {
      let resData = null

      try {
        const res = await api.get(`/invoices/${invoiceId}`)
        if (res.data && res.data.data) {
          resData = res.data.data
        }
      } catch (err) {
        const listRes = await api.get('/invoices')
        if (listRes.data && listRes.data.data && Array.isArray(listRes.data.data.invoices)) {
          resData = listRes.data.data.invoices.find(
            (i) => i._id === invoiceId || i.invoiceNumber === invoiceId
          )
        }
      }

      if (resData) {
        const rawDate = resData.invoiceDate ? new Date(resData.invoiceDate).toISOString().split('T')[0] : ''
        const rawDue = resData.dueDate ? new Date(resData.dueDate).toISOString().split('T')[0] : ''

        const formattedInvoice = {
          _id: resData._id,
          id: resData.invoiceNumber || resData._id,
          invoiceNumber: resData.invoiceNumber || 'INV-001',
          vendorName: resData.vendorName || '-',
          vendorGstin: resData.vendorGstin || '-',
          vendorAddress: resData.vendorAddress || '-',
          vendorEmail: resData.vendorEmail || '-',
          buyerName: resData.buyerName || '-',
          buyerGstin: resData.buyerGstin || '-',
          buyerAddress: resData.buyerAddress || '-',
          buyerEmail: resData.buyerEmail || '-',
          category: resData.category || '-',
          invoiceDate: resData.invoiceDate ? (typeof resData.invoiceDate === 'string' && !resData.invoiceDate.includes('T') ? resData.invoiceDate : new Date(resData.invoiceDate).toLocaleDateString()) : '-',
          dueDate: resData.dueDate ? (typeof resData.dueDate === 'string' && !resData.dueDate.includes('T') ? resData.dueDate : new Date(resData.dueDate).toLocaleDateString()) : '-',
          rawInvoiceDate: rawDate,
          rawDueDate: rawDue,
          paymentTerms: resData.paymentTerms || 'Net 30',
          submittedBy: 'Finance Executive',
          approvedBy: resData.approvedBy?.name || 'Finance Manager',
          uploadedBy: resData.uploadedBy,
          confidenceScore: resData.confidenceScore || resData.ocrConfidence || 95.0,
          extractionSource: resData.extractionSource || 'OCR',
          status: resData.status || 'Pending',
          revisionNumber: resData.revisionNumber || 1,
          duplicate: Boolean(resData.duplicate),
          matchedInvoice: resData.matchedInvoice || null,
          subtotal: resData.subtotal || Math.round((resData.amount || 0) * 0.85),
          gstAmount: resData.gst || Math.round((resData.amount || 0) * 0.15),
          cgst: resData.cgst || 0,
          sgst: resData.sgst || 0,
          igst: resData.igst || 0,
          discount: resData.discount || 0,
          amount: resData.amount || resData.totalAmount || 0,
          totalAmount: resData.amount || resData.totalAmount || 0,
          currency: resData.currency || 'INR',
          notes: resData.notes || '',
          invoiceUrl: resData.invoiceUrl || '',
          lineItems: (resData.lineItems && resData.lineItems.length > 0)
            ? resData.lineItems.map((item, idx) => ({
                id: item._id || idx + 1,
                description: item.description || item.desc || 'Line Item',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                taxRate: item.taxRate || 0,
                taxAmount: item.taxAmount || item.tax || 0,
                total: item.amount || item.total || ((item.quantity || 1) * (item.unitPrice || 0)),
              }))
            : [
                {
                  id: 1,
                  description: `${resData.category || 'General'} - Line Item 1`,
                  quantity: 1,
                  unitPrice: Math.round((resData.amount || 0) * 0.85),
                  taxRate: 18,
                  taxAmount: Math.round((resData.amount || 0) * 0.15),
                  total: resData.amount || 0,
                },
              ],
          rejectionReason: resData.rejectionReason || '',
          rejectionComment: resData.rejectionComment || '',
          relatedInvoiceId: resData.relatedInvoiceId || null,
          rejectedBy: resData.rejectedBy,
          rejectedAt: resData.rejectedAt,
          paidBy:
            resData.paidBy?.name ||
            (typeof resData.paidBy === 'string' && !/^[0-9a-fA-F]{24}$/.test(resData.paidBy)
              ? resData.paidBy
              : 'Finance Executive'),
          paidAt: resData.paidAt ? new Date(resData.paidAt).toLocaleString() : '',
          paymentStatus: resData.paymentStatus || 'UNPAID',
          previousRevisionData: resData.previousRevisionData || null,
          approvalHistory: resData.approvalHistory || [],
          createdAt: resData.createdAt ? new Date(resData.createdAt).toLocaleString() : new Date().toLocaleDateString(),
          updatedAt: resData.updatedAt ? new Date(resData.updatedAt).toLocaleString() : new Date().toLocaleDateString(),
        }

        setInvoice(formattedInvoice)
        setStatus(formattedInvoice.status)
      } else {
        showToast('Invoice document not found', 'error')
      }
    } catch (err) {
      console.error('[InvoiceDetails] Error fetching invoice:', err)
      showToast('Could not load invoice details', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoiceData()
  }, [invoiceId])

  // Populate inline edit state when starting correction
  const startEditing = () => {
    if (!invoice) return
    setFormVendorName(invoice.vendorName || '')
    setFormVendorGstin(invoice.vendorGstin !== 'N/A' ? invoice.vendorGstin : '')
    setFormVendorEmail(invoice.vendorEmail || '')
    setFormVendorAddress(invoice.vendorAddress || '')
    setFormInvoiceNumber(invoice.invoiceNumber || '')
    setFormInvoiceDate(invoice.rawInvoiceDate || '')
    setFormDueDate(invoice.rawDueDate || '')
    setFormCurrency(invoice.currency || 'INR')
    setFormPaymentTerms(invoice.paymentTerms || 'Net 30')
    setFormNotes(invoice.notes || '')

    setFormSubtotal(invoice.subtotal || 0)
    setFormGst(invoice.gstAmount || 0)
    setFormCgst(invoice.cgst || 0)
    setFormSgst(invoice.sgst || 0)
    setFormIgst(invoice.igst || 0)
    setFormDiscount(invoice.discount || 0)
    setFormGrandTotal(invoice.totalAmount || 0)

    setFormLineItems(
      invoice.lineItems.map((item) => ({ ...item }))
    )

    setResubmitError('')
    setIsEditing(true)
  }

  const handleDeleteInvoice = async () => {
    if (!invoice) return
    if (!window.confirm(`Are you sure you want to delete rejected invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) return
    try {
      if (invoice._id && !invoice._id.startsWith('inv-demo')) {
        await api.delete(`/invoices/${invoice._id}`)
      }
      showToast(`Invoice #${invoice.invoiceNumber} deleted successfully`, 'info')
      navigate('/app/invoices')
    } catch (err) {
      console.error('Failed to delete invoice:', err)
      showToast(err.response?.data?.message || 'Failed to delete invoice', 'danger')
    }
  }

  // Recalculate line item totals and grand total
  const updateLineItem = (index, field, value) => {
    const updated = [...formLineItems]
    updated[index][field] = value

    const qty = Number(updated[index].quantity) || 0
    const price = Number(updated[index].unitPrice) || 0
    const taxRate = Number(updated[index].taxRate) || 0

    const lineSub = qty * price
    const lineTax = (lineSub * taxRate) / 100
    updated[index].taxAmount = Math.round(lineTax)
    updated[index].total = Math.round(lineSub + lineTax)

    setFormLineItems(updated)

    // Recompute header totals
    const newSub = updated.reduce((acc, i) => acc + (Number(i.quantity || 0) * Number(i.unitPrice || 0)), 0)
    const newTax = updated.reduce((acc, i) => acc + (Number(i.taxAmount) || 0), 0)
    setFormSubtotal(Math.round(newSub))
    setFormGst(Math.round(newTax))
    setFormGrandTotal(Math.round(newSub + newTax - (Number(formDiscount) || 0)))
  }

  const addLineItem = () => {
    setFormLineItems((prev) => [
      ...prev,
      { id: Date.now(), description: 'New Line Item', quantity: 1, unitPrice: 0, taxRate: 18, taxAmount: 0, total: 0 },
    ])
  }

  const removeLineItem = (index) => {
    if (formLineItems.length <= 1) return
    const updated = formLineItems.filter((_, i) => i !== index)
    setFormLineItems(updated)

    const newSub = updated.reduce((acc, i) => acc + (Number(i.quantity || 0) * Number(i.unitPrice || 0)), 0)
    const newTax = updated.reduce((acc, i) => acc + (Number(i.taxAmount) || 0), 0)
    setFormSubtotal(Math.round(newSub))
    setFormGst(Math.round(newTax))
    setFormGrandTotal(Math.round(newSub + newTax - (Number(formDiscount) || 0)))
  }

  // Handle Resubmit Submission
  const handleResubmitInvoice = async () => {
    setResubmitError('')
    if (!formVendorName.trim()) {
      setResubmitError('Vendor Name is required.')
      return
    }
    if (!formInvoiceNumber.trim()) {
      setResubmitError('Invoice Number is required.')
      return
    }
    if (!formInvoiceDate) {
      setResubmitError('Invoice Date is required.')
      return
    }
    if (!formGrandTotal || formGrandTotal <= 0) {
      setResubmitError('Grand Total must be greater than 0.')
      return
    }

    if (!window.confirm(`Are you sure you want to resubmit invoice ${formInvoiceNumber} with corrected details for manager approval?`)) {
      return
    }

    setResubmitLoading(true)
    try {
      const payload = {
        vendorName: formVendorName.trim(),
        vendorGstin: formVendorGstin.trim(),
        vendorEmail: formVendorEmail.trim(),
        vendorAddress: formVendorAddress.trim(),
        invoiceNumber: formInvoiceNumber.trim(),
        invoiceDate: formInvoiceDate,
        dueDate: formDueDate || undefined,
        currency: formCurrency,
        paymentTerms: formPaymentTerms,
        notes: formNotes,
        subtotal: formSubtotal,
        gst: formGst,
        cgst: formCgst,
        sgst: formSgst,
        igst: formIgst,
        discount: formDiscount,
        amount: formGrandTotal,
        lineItems: formLineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          amount: item.total,
        })),
      }

      await api.put(`/invoices/${invoice._id}/resubmit`, payload)
      showToast('Invoice corrected & resubmitted for approval!', 'success')
      setIsEditing(false)
      fetchInvoiceData()
    } catch (err) {
      console.error('Resubmit error:', err)
      setResubmitError(err.response?.data?.message || 'Failed to resubmit invoice. Please check fields.')
    } finally {
      setResubmitLoading(false)
    }
  }

  const handleConfirmMarkAsPaid = async () => {
    if (!invoice) return
    setMarkPaidLoading(true)
    try {
      await api.patch(`/invoices/${invoice._id}/mark-paid`)
      showToast(`Invoice #${invoice.invoiceNumber} marked as PAID successfully!`, 'success')
      setIsMarkPaidModalOpen(false)
      fetchInvoiceData()
    } catch (err) {
      console.error('Mark as paid error:', err)
      showToast(err.response?.data?.message || 'Failed to mark invoice as paid', 'error')
    } finally {
      setMarkPaidLoading(false)
    }
  }

  const handleConfirmApprove = async (comment) => {
    if (!isManager || !invoice) return
    const newStatus = 'Approved'
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}`, {
          status: newStatus,
          comments: comment ? [comment] : [],
        })
      }
      setStatus(newStatus)
      showToast('Invoice Approved successfully!', 'success')
      fetchInvoiceData()
    } catch (err) {
      console.error('Approve failed:', err)
      showToast(err.response?.data?.message || 'Approval failed', 'error')
    } finally {
      setIsApproveModalOpen(false)
    }
  }

  const handleConfirmReject = async ({ rejectionReason, rejectionComment, relatedInvoiceId }) => {
    if (!isManager || !invoice) return
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}/reject`, {
          rejectionReason,
          rejectionComment,
          relatedInvoiceId,
        })
      }
      showToast('Invoice rejection processed successfully', 'success')
      fetchInvoiceData()
    } catch (err) {
      console.error('Reject failed:', err)
      showToast(err.response?.data?.message || 'Rejection failed', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-slate-500">Fetching invoice record from MongoDB...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-rose-500" />
        <div>
          <h2 className="text-lg font-black text-slate-900">Invoice Record Not Found</h2>
          <p className="text-xs text-slate-500">No matching invoice found for ID: {invoiceId}</p>
        </div>
        <Link
          to="/app/invoices"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          Return to All Invoices
        </Link>
      </div>
    )
  }

  // Check if current user is owner of invoice
  const isOwner =
    !invoice.uploadedBy ||
    invoice.uploadedBy === user?._id ||
    invoice.uploadedBy === user?.id ||
    (user?.email && invoice.uploadedBy?.email === user?.email)

  const isResubmitted = invoice.revisionNumber > 1 || status === 'Pending' && invoice.previousRevisionData

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-600 text-sm">#{invoice.invoiceNumber}</span>
              
              {/* Revision Number Badge */}
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-extrabold text-slate-700">
                Revision {invoice.revisionNumber || 1}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                  status === 'PAID' || status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : status === 'PAYMENT_QUEUE' || status === 'Approved'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : status === 'NEEDS_CORRECTION' || status === 'Rejected'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : status === 'DUPLICATE_SUBMISSION'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : status === 'ALREADY_PAID'
                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                    : isResubmitted
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status === 'PAID' || status === 'Paid' ? (
                  <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                ) : status === 'PAYMENT_QUEUE' || status === 'Approved' ? (
                  <CreditCard className="h-3 w-3" />
                ) : status === 'NEEDS_CORRECTION' || status === 'Rejected' ? (
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                ) : status === 'DUPLICATE_SUBMISSION' || status === 'ALREADY_PAID' ? (
                  <XCircle className="h-3 w-3" />
                ) : isResubmitted ? (
                  <RefreshCw className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {status === 'PAID' || status === 'Paid'
                  ? 'PAID'
                  : status === 'PAYMENT_QUEUE'
                  ? 'Payment Queue'
                  : status === 'NEEDS_CORRECTION' || status === 'Rejected'
                  ? 'Needs Correction'
                  : status === 'DUPLICATE_SUBMISSION'
                  ? 'Duplicate Submission'
                  : status === 'ALREADY_PAID'
                  ? 'Already Paid'
                  : isResubmitted && status === 'Pending'
                  ? 'Resubmitted'
                  : status}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{invoice.vendorName}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* MANAGER ACTIONS */}
          {isManager && (status === 'Pending' || status === 'PENDING_APPROVAL') && (
            <>
              <button
                onClick={() => setIsApproveModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Approve Invoice</span>
              </button>

              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[3]" />
                <span>Reject Invoice</span>
              </button>
            </>
          )}

          {/* FINANCE CORRECTION: FIX & RESUBMIT BUTTON */}
          {isFinance && (status === 'NEEDS_CORRECTION' || status === 'Needs Correction') && isOwner && !isEditing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Fix & Resubmit</span>
            </button>
          )}

          {/* FINANCE REJECTED: DELETE REJECTED INVOICE BUTTON */}
          {isFinance && (status === 'Rejected' || status === 'DUPLICATE_SUBMISSION' || status === 'ALREADY_PAID') && isOwner && (
            <button
              onClick={handleDeleteInvoice}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 cursor-pointer transition active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Rejected Invoice</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Bill</span>
          </button>
        </div>
      </div>

      {/* DUPLICATION RISK WARNING BANNER FOR MANAGER & AUDITORS */}
      {(invoice.duplicate || invoice.matchedInvoice) && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
            <div className="flex items-center gap-3 text-rose-950">
              <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-rose-950">
                    DUPLICATION RISK DETECTED
                  </h3>
                  <span className="rounded-md bg-rose-200 text-rose-900 px-2 py-0.5 text-[10px] font-black uppercase">
                    {invoice.matchedInvoice?.status || (status === 'PAID' || status === 'Paid' ? 'WAS ALREADY PAID' : 'ALREADY SUBMITTED & PENDING')}
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  AI engine flagged a matching invoice in MongoDB. Review details below before taking action.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs rounded-xl bg-white/90 p-2.5 border border-rose-200 shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-rose-600 block">Submitted By</span>
              <p className="font-bold text-slate-900">
                {invoice.matchedInvoice?.sentBy || invoice.matchedInvoice?.submittedBy || 'Finance Executive'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Finance Executive Account</p>
            </div>
          </div>

          <div className="rounded-xl bg-white/80 p-3.5 border border-rose-200 space-y-1.5 text-xs text-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
              Duplication Audit Result & Proper Reason:
            </span>
            <p className="font-bold text-slate-900">
              {invoice.matchedInvoice?.reason ||
                `Duplicate invoice #${invoice.invoiceNumber} for vendor '${invoice.vendorName}' (${formatCurrency(invoice.totalAmount, invoice.currency)}) matches an existing bill previously uploaded by ${invoice.matchedInvoice?.sentBy || 'Finance Executive'}.`}
            </p>
            {invoice.matchedInvoice?.paidAt && (
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Original Invoice Settlement: Paid on {new Date(invoice.matchedInvoice.paidAt).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* PAID SETTLEMENT BANNER */}
      {(status === 'PAID' || status === 'Paid') && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-500/10 via-emerald-50/90 to-teal-500/10 p-5 shadow-xs backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-emerald-950">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/30 shrink-0">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-950">
                    PAYMENT COMPLETED & SETTLED
                  </h3>
                  <span className="rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
                    Read-Only Audit Record
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-800 mt-0.5">
                  This invoice has been disbursed and marked as paid. Financial values are permanently locked.
                </p>
              </div>
            </div>

            {/* Settlement Info Card */}
            <div className="rounded-xl bg-white/95 p-3 border border-emerald-200 shadow-2xs shrink-0 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="text-left text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Disbursed By (Finance)
                </span>
                <div className="font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span className="text-emerald-950 bg-emerald-100/90 px-2.5 py-0.5 rounded-md text-xs font-bold border border-emerald-200">
                    {invoice.paidBy || 'Finance Executive'}
                  </span>
                </div>
                {invoice.paidAt && (
                  <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{invoice.paidAt}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT QUEUE BANNER */}
      {(status === 'PAYMENT_QUEUE' || (status === 'Approved' && status !== 'PAID')) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-indigo-950">
            <CreditCard className="h-6 w-6 text-indigo-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-950">AWAITING PAYMENT (IN PAYMENT QUEUE)</h3>
              <p className="text-xs text-indigo-800 mt-0.5">Manager approved invoice. Invoice is in the Payment Queue ready for disbursement.</p>
            </div>
          </div>
          {isFinance && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMarkPaidModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> Mark as Paid
              </button>
              <Link
                to="/app/payment-queue"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition shrink-0"
              >
                <CreditCard className="h-3.5 w-3.5" /> Go to Payment Queue
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 1. CORRECTION REQUIRED BANNER */}
      {(status === 'NEEDS_CORRECTION' || status === 'Rejected') && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-sm border-b border-amber-200/80 pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span>INVOICE REJECTED — CORRECTION REQUIRED</span>
              <p className="text-[11px] font-normal text-amber-800">
                Review rejection notes below. Click 'Fix & Resubmit' above to edit values and resubmit for approval.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs text-amber-950">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Rejection Reason</span>
              <p className="font-extrabold text-sm text-amber-950">Correction Required</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Manager Correction Notes</span>
              <p className="font-medium text-amber-900 italic">
                {invoice.rejectionComment ? `"${invoice.rejectionComment}"` : 'No additional correction notes provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUPLICATE SUBMISSION BANNER */}
      {status === 'DUPLICATE_SUBMISSION' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
            <div className="flex items-center gap-3 text-rose-950">
              <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-rose-950">
                    DUPLICATE SUBMISSION — CLOSED
                  </h3>
                  <span className="rounded-md bg-rose-200 text-rose-900 px-2 py-0.5 text-[10px] font-black uppercase">
                    Read-Only
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  Already submitted through another invoice. This invoice is permanently closed.
                </p>
              </div>
            </div>

            {invoice.relatedInvoiceId && (
              <Link
                to={`/app/invoice/${invoice.relatedInvoiceId._id || invoice.relatedInvoiceId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Related Invoice</span>
              </Link>
            )}
          </div>

          <div className="rounded-xl bg-white/80 p-3.5 border border-rose-200 text-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-rose-700 block">Related Submission Reference:</span>
            <p className="font-extrabold text-slate-900">
              Related Invoice:{' '}
              <span className="text-rose-900 font-mono font-black">
                {invoice.relatedInvoiceId?.invoiceNumber || 'INV-1054'}
              </span>
              {invoice.relatedInvoiceId?.vendorName && (
                <span className="font-semibold text-slate-700"> — {invoice.relatedInvoiceId.vendorName}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* 3. ALREADY PAID BANNER */}
      {status === 'ALREADY_PAID' && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/90 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200 pb-3">
            <div className="flex items-center gap-3 text-purple-950">
              <XCircle className="h-6 w-6 text-purple-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-purple-950">
                    ALREADY PAID — CLOSED
                  </h3>
                  <span className="rounded-md bg-purple-200 text-purple-900 px-2 py-0.5 text-[10px] font-black uppercase">
                    Read-Only
                  </span>
                </div>
                <p className="text-xs text-purple-800 font-medium mt-0.5">
                  Payment already exists for this invoice. Financial duplicate closed.
                </p>
              </div>
            </div>

            {invoice.relatedInvoiceId && (
              <Link
                to={`/app/invoice/${invoice.relatedInvoiceId._id || invoice.relatedInvoiceId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Related Invoice</span>
              </Link>
            )}
          </div>

          <div className="rounded-xl bg-white/80 p-3.5 border border-purple-200 text-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 block">Related Settlement Reference:</span>
            <p className="font-extrabold text-slate-900">
              Related Paid Invoice:{' '}
              <span className="text-purple-900 font-mono font-black">
                {invoice.relatedInvoiceId?.invoiceNumber || 'INV-1054'}
              </span>
              {invoice.relatedInvoiceId?.vendorName && (
                <span className="font-semibold text-slate-700"> — {invoice.relatedInvoiceId.vendorName}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* MANAGER RESUBMITTED REVISION BANNER */}
      {isResubmitted && status === 'Pending' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
              <RefreshCw className="h-4.5 w-4.5 text-blue-600" />
              <span>RESUBMITTED FOR APPROVAL — REVISION {invoice.revisionNumber}</span>
            </div>
            <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
              Revision #{invoice.revisionNumber}
            </span>
          </div>

          {invoice.previousRevisionData && (
            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-white p-3 border border-blue-100 space-y-1">
                <p className="font-bold text-slate-800">Previously Rejected Reason:</p>
                <p className="text-slate-600 italic text-[11px]">"{invoice.previousRevisionData.rejectionReason || 'Incorrect Total'}"</p>
              </div>

              {/* Changed Fields Diff List */}
              {invoice.approvalHistory && invoice.approvalHistory.find((h) => h.action === 'RESUBMITTED')?.changes?.length > 0 && (
                <div className="rounded-xl bg-white p-3 border border-blue-100 space-y-1.5">
                  <p className="font-bold text-blue-900">Finance Corrections / Modified Fields:</p>
                  <ul className="space-y-1 text-[11px]">
                    {invoice.approvalHistory.find((h) => h.action === 'RESUBMITTED')?.changes.map((c, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-medium">
                        <span className="font-bold text-slate-700 min-w-[100px]">{c.field}:</span>
                        <span className="line-through text-slate-400">{String(c.oldValue)}</span>
                        <span>→</span>
                        <strong className="text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {String(c.newValue)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left = Bill & Audit Trail | Right = Document Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT SIDE (7 COLS): Full Bill Fields, Line Items, & Audit Trail */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. INLINE EDITING FORM OR BILL & VENDOR INFORMATION CARD */}
          {isEditing ? (
            <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Edit3 className="h-5 w-5" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Correction & Resubmission Form</h2>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 font-mono">
                  Editing Revision #{invoice.revisionNumber + 1}
                </span>
              </div>

              {resubmitError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{resubmitError}</span>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">
                    Vendor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formVendorName}
                    onChange={(e) => setFormVendorName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Vendor GSTIN</label>
                  <input
                    type="text"
                    value={formVendorGstin}
                    onChange={(e) => setFormVendorGstin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Vendor Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formVendorEmail}
                      onChange={(e) => setFormVendorEmail(e.target.value)}
                      placeholder="vendor@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">
                    Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold text-blue-600 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">
                    Invoice Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formInvoiceDate}
                    onChange={(e) => setFormInvoiceDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Vendor Address</label>
                  <textarea
                    rows={2}
                    value={formVendorAddress}
                    onChange={(e) => setFormVendorAddress(e.target.value)}
                    placeholder="Enter complete vendor address..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Line Items Correction Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-900">Line Items Breakdown</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formLineItems.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 font-medium text-slate-900"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                          placeholder="QTY"
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 font-bold text-center text-slate-900"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                          placeholder="Unit Price"
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 font-semibold text-right text-slate-900"
                        />
                      </div>
                      <div className="w-24 font-bold text-right text-slate-900 pt-1">
                        ₹{item.total.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Form Box */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono text-sm">₹{formSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Calculated GST Tax:</span>
                  <span className="font-mono text-sm">₹{formGst.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-300 font-black text-sm">
                  <span className="text-slate-900">Grand Total Amount:</span>
                  <span className="text-blue-600 font-mono text-base">₹{formGrandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={resubmitLoading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResubmitInvoice}
                  disabled={resubmitLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {resubmitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Resubmit for Approval</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              
              {/* TOP HEADER BAR WITH CLEAN SIMPLE AI EXTRACTION BADGE */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Master Invoice Record</span>
                <span className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-800 font-mono">
                  {(invoice.extractionSource || 'GEMINI').toUpperCase()} {invoice.confidenceScore || 95}%
                </span>
              </div>

              {/* SINGLE PARTY CARD: CLIENT'S DETAILS */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 text-xs">
                <h3 className="text-blue-600 font-bold text-sm">Client's details:</h3>
                <p className="font-black text-slate-900 text-sm">
                  {invoice.vendorName && invoice.vendorName !== 'Unknown Vendor' && invoice.vendorName !== 'Extracted Vendor' ? invoice.vendorName : '-'}
                </p>
                <div className="text-slate-600 font-medium space-y-1 pt-1">
                  <p><strong className="text-slate-700 font-bold">Address: </strong>{invoice.vendorAddress && invoice.vendorAddress !== '-' ? invoice.vendorAddress : '-'}</p>
                  <p><strong className="text-slate-700 font-bold">Email: </strong>{invoice.vendorEmail && invoice.vendorEmail !== '-' ? invoice.vendorEmail : '-'}</p>
                  <p><strong className="text-slate-700 font-bold">GSTIN: </strong>{invoice.vendorGstin && invoice.vendorGstin !== 'N/A' && invoice.vendorGstin !== '-' ? invoice.vendorGstin : '-'}</p>
                </div>
              </div>

              {/* INVOICE NO & DATES ROW */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <p>Invoice No : <span className="font-mono font-black text-slate-900">{invoice.invoiceNumber || '-'}</span></p>
                  <p>Invoice Date : <span className="text-slate-900 font-semibold">{invoice.invoiceDate || '-'}</span></p>
                </div>
                <div className="text-right">
                  <p>Due Date : <span className="text-slate-900 font-semibold">{invoice.dueDate && invoice.dueDate !== 'null' ? invoice.dueDate : '-'}</span></p>
                </div>
              </div>

              {/* LINE ITEMS TABLE (Item, Qty, Price, Tax, Subtotal) */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-700">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-right">Tax</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 ? (
                      invoice.lineItems.map((item, idx) => {
                        const itemName = item.description && item.description !== 'Line Item' && item.description !== 'N/A' ? item.description : '-'
                        const qtyVal = (item.quantity !== undefined && item.quantity !== null && item.quantity !== '' && item.quantity !== 0) ? item.quantity : '-'
                        const priceVal = (item.unitPrice || item.rate) ? formatCurrency(item.unitPrice || item.rate, invoice.currency) : '-'
                        const taxVal = (item.taxAmount || item.tax) ? formatCurrency(item.taxAmount || item.tax, invoice.currency) : (item.taxRate ? `${item.taxRate}%` : '-')
                        const totalVal = (item.total || item.amount) ? formatCurrency(item.total || item.amount, invoice.currency) : '-'

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{itemName}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">{qtyVal}</td>
                            <td className="py-3.5 px-4 text-right text-slate-600">{priceVal}</td>
                            <td className="py-3.5 px-4 text-right text-slate-600">{taxVal}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">{totalVal}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-3.5 px-4 text-center text-slate-400 font-medium">No line items extracted</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* INVOICE SUMMARY BOX (RIGHT ALIGNED) */}
              <div className="flex flex-col items-end pt-2">
                <div className="w-full max-w-xs space-y-3">
                  <div className="border-b border-slate-200 pb-2 text-center text-xs font-bold uppercase text-slate-800 tracking-wider">
                    Invoice Summary
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    {/* Tax field before SubTotal field */}
                    <div className="flex justify-between items-center">
                      <span>Tax</span>
                      <span className="text-slate-900 font-bold">{invoice.gstAmount > 0 ? formatCurrency(invoice.gstAmount, invoice.currency) : '-'}</span>
                    </div>

                    {/* Subtotal field */}
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-slate-900 font-bold">{invoice.subtotal > 0 ? formatCurrency(invoice.subtotal, invoice.currency) : '-'}</span>
                    </div>

                    {/* Total field */}
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                      <span>Total</span>
                      <span className="text-slate-900 font-mono font-black">{invoice.totalAmount > 0 ? formatCurrency(invoice.totalAmount, invoice.currency) : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. FULL AUDIT & APPROVAL LIFECYCLE TRAIL CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Full Audit & Lifecycle History</h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Timestamped Record</span>
            </div>

            <div className="relative pl-6 space-y-6 text-xs border-l-2 border-slate-200">
              
              {/* Render dynamic approval history entries if recorded */}
              {Array.isArray(invoice.approvalHistory) && invoice.approvalHistory.length > 0 ? (
                invoice.approvalHistory.map((h, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-xs ${
                        h.action === 'PAYMENT_COMPLETED'
                          ? 'bg-emerald-600 ring-4 ring-emerald-100'
                          : h.action === 'APPROVED'
                          ? 'bg-indigo-600'
                          : h.action === 'REJECTED'
                          ? 'bg-rose-600'
                          : h.action === 'RESUBMITTED'
                          ? 'bg-blue-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      {h.action === 'PAYMENT_COMPLETED' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      ) : h.action === 'APPROVED' ? (
                        <UserCheck className="h-3.5 w-3.5" />
                      ) : h.action === 'REJECTED' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : h.action === 'RESUBMITTED' ? (
                        <RefreshCw className="h-3.5 w-3.5" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">
                          {idx + 1}. {h.action === 'PAYMENT_COMPLETED' ? 'PAYMENT COMPLETED & MARKED AS PAID' : h.action === 'APPROVED' ? 'APPROVED & MOVED TO PAYMENT QUEUE' : h.action} (Revision #{h.revisionNumber || 1})
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {h.timestamp ? new Date(h.timestamp).toLocaleString() : '-'}
                        </span>
                      </div>

                      <p className="text-slate-600 font-medium">
                        Performed by <strong className="text-slate-800">{h.performedByName || 'User'}</strong> ({h.performedByRole || 'Role'})
                      </p>

                      {h.reason && (
                        <p className="text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl text-[11px]">
                          Rejection Reason: "{h.reason}"
                        </p>
                      )}

                      {h.comment && (
                        <p className="text-slate-700 italic bg-slate-50 p-2 rounded-xl text-[11px]">
                          Note: "{h.comment}"
                        </p>
                      )}

                      {Array.isArray(h.changes) && h.changes.length > 0 && (
                        <div className="bg-blue-50/70 border border-blue-100 p-2 rounded-xl text-[11px] space-y-0.5">
                          <p className="font-bold text-blue-900">Fields Corrected:</p>
                          {h.changes.map((c, cIdx) => (
                            <p key={cIdx} className="text-slate-700">
                              • <strong>{c.field}:</strong> <span className="line-through text-slate-400">{String(c.oldValue)}</span> → <strong className="text-emerald-700 font-mono">{String(c.newValue)}</strong>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback static timeline if history array is empty */
                <>
                  {/* STEP 1: Upload & Extraction */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                      <FileCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">1. Invoice Document Ingested</p>
                        <span className="text-[10px] text-slate-400 font-mono">{invoice.createdAt}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Processed by <strong className="text-slate-800">{invoice.submittedBy}</strong> using {invoice.extractionSource} strategy.
                      </p>
                    </div>
                  </div>

                  {/* STEP 2: Pass to Approval */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">2. Submitted for Authorization</p>
                        <span className="text-[10px] text-slate-400 font-mono">{invoice.createdAt}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Passed to Manager Approval Queue by <strong className="text-slate-800">{invoice.submittedBy}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* STEP 3: Current Status */}
                  <div className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-xs ${
                        status === 'Approved' || status === 'PAYMENT_QUEUE' || status === 'PAID' || status === 'Paid'
                          ? 'bg-emerald-600'
                          : status === 'NEEDS_CORRECTION'
                          ? 'bg-amber-500'
                          : status === 'DUPLICATE_SUBMISSION'
                          ? 'bg-rose-600'
                          : status === 'ALREADY_PAID'
                          ? 'bg-purple-600'
                          : 'bg-amber-500 animate-pulse'
                      }`}
                    >
                      {status === 'Approved' || status === 'PAYMENT_QUEUE' || status === 'PAID' || status === 'Paid' ? (
                        <UserCheck className="h-3.5 w-3.5" />
                      ) : status === 'NEEDS_CORRECTION' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : status === 'DUPLICATE_SUBMISSION' || status === 'ALREADY_PAID' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">
                          {status === 'Approved' || status === 'PAYMENT_QUEUE' || status === 'PAID' || status === 'Paid'
                            ? '3. Manager Approved & Authorized'
                            : status === 'NEEDS_CORRECTION'
                            ? '3. Manager Requested Correction'
                            : status === 'DUPLICATE_SUBMISSION'
                            ? '3. Closed as Duplicate Submission'
                            : status === 'ALREADY_PAID'
                            ? '3. Closed as Already Paid'
                            : '3. Awaiting Manager Approval'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{invoice.updatedAt}</span>
                      </div>

                      {status === 'Approved' && (
                        <p className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                          Authorized by <strong className="text-emerald-950">{invoice.approvedBy}</strong> for financial settlement.
                        </p>
                      )}

                      {status === 'Rejected' && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1">
                          <p className="text-rose-800 font-bold">
                            Rejected by <strong className="text-rose-950">{invoice.approvedBy || 'Manager'}</strong>
                          </p>
                          {invoice.rejectionReason && (
                            <p className="text-rose-700 font-medium italic text-[11px]">
                              Rejection Reason: "{invoice.rejectionReason}"
                            </p>
                          )}
                        </div>
                      )}

                      {status === 'Pending' && (
                        <p className="text-amber-700 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-xl">
                          Invoice is currently in the Manager Approval Queue awaiting authorization.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT SIDE (5 COLS): Original Source Document */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 space-y-6">
            
            {/* DOCUMENT PREVIEW CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Source Document</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">PDF / Image Preview</span>
              </div>

              <DocumentViewer invoice={invoice} />
            </div>

          </div>
        </div>
      </div>

      {/* REJECTION MODAL FOR MANAGER */}
      <RejectInvoiceModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        invoice={invoice}
        onConfirm={handleConfirmReject}
      />

      {/* APPROVAL CONFIRMATION MODAL WITH HIGH Z-INDEX */}
      <ApproveInvoiceModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        invoice={invoice}
        onConfirm={handleConfirmApprove}
      />

      {/* MARK AS PAID CONFIRMATION MODAL */}
      {isMarkPaidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-emerald-100 animate-in fade-in zoom-in duration-200 text-left">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                <h3 className="text-base font-black text-slate-900">Mark Invoice as Paid?</h3>
              </div>
              <button
                onClick={() => setIsMarkPaidModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Invoice Overview */}
            {invoice && (
              <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Vendor:</span>
                  <strong className="text-slate-900 font-bold">{invoice.vendorName}</strong>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Invoice Number:</span>
                  <span className="font-mono font-bold text-blue-600">#{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Approved Amount:</span>
                  <strong className="text-emerald-700 font-black text-sm">
                    {formatCurrency(invoice.amount || invoice.totalAmount || 0, invoice.currency)}
                  </strong>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-600 font-medium">
              Are you sure the payment has been completed? This will mark the invoice as <strong className="text-emerald-700">PAID</strong>, create an audit entry, and move the invoice into the Paid Ledger.
            </p>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsMarkPaidModalOpen(false)}
                disabled={markPaidLoading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkAsPaid}
                disabled={markPaidLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {markPaidLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                )}
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
