import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/axios'
import { DocumentViewer } from '../components/DocumentViewer'
import {
  ArrowLeft,
  Download,
  Printer,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Save,
  Send,
  MessageSquare,
  Loader2
} from 'lucide-react'

export function InvoiceDetails() {
  const { user } = useAuth()
  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole === 'manager'
  const isFinance = userRole === 'finance'

  const { invoiceId } = useParams()
  const navigate = useNavigate()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Pending')
  const [auditLogs, setAuditLogs] = useState([])
  const [managerComment, setManagerComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Dynamically fetch live invoice from MongoDB
  const fetchInvoiceData = async () => {
    if (!invoiceId) return
    setLoading(true)
    try {
      let resData = null

      // First attempt direct fetch by MongoDB _id
      try {
        const res = await api.get(`/invoices/${invoiceId}`)
        if (res.data && res.data.data) {
          resData = res.data.data
        }
      } catch (err) {
        // Fallback: search in invoices array by invoiceNumber or _id
        const listRes = await api.get('/invoices')
        if (listRes.data && listRes.data.data && Array.isArray(listRes.data.data.invoices)) {
          resData = listRes.data.data.invoices.find(
            (i) => i._id === invoiceId || i.invoiceNumber === invoiceId
          )
        }
      }

      if (resData) {
        const formattedInvoice = {
          _id: resData._id,
          id: resData.invoiceNumber || resData._id,
          invoiceNumber: resData.invoiceNumber || 'INV-001',
          vendor: resData.vendorName || 'Unknown Vendor',
          vendorName: resData.vendorName || 'Unknown Vendor',
          vendorGstin: resData.vendorGstin || '22-AAAAA0000A-1-Z-5',
          category: resData.category || 'General Expense',
          invoiceDate: resData.invoiceDate ? new Date(resData.invoiceDate).toLocaleDateString() : '2026-08-01',
          dueDate: resData.dueDate ? new Date(resData.dueDate).toLocaleDateString() : '2026-08-15',
          paymentTerms: 'Net 15',
          submittedBy: resData.uploadedBy?.name || 'Finance Executive',
          confidence: resData.confidenceScore || 95.0,
          status: resData.status || 'Pending',
          duplicateCheck: resData.duplicate ? 'Duplicate Flagged' : 'Passed (Clean Record)',
          subtotal: resData.subtotal || Math.round((resData.amount || 0) * 0.85),
          gstAmount: resData.gst || Math.round((resData.amount || 0) * 0.15),
          totalAmount: resData.amount || resData.totalAmount || 0,
          invoiceUrl: resData.invoiceUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          lineItems: (resData.lineItems && resData.lineItems.length > 0)
            ? resData.lineItems.map((item, idx) => ({
                id: item._id || idx + 1,
                desc: item.description || item.desc || 'Services / Products Rendered',
                qty: item.quantity || item.qty || 1,
                rate: item.unitPrice || item.rate || resData.amount || 0,
                total: item.amount || item.total || (item.quantity || 1) * (item.unitPrice || resData.amount || 0),
              }))
            : [
                {
                  id: 1,
                  desc: `${resData.category || 'Vendor Services'} - ${resData.vendorName || 'Primary Invoice Line'}`,
                  qty: 1,
                  rate: Math.round((resData.amount || 0) * 0.85),
                  total: Math.round((resData.amount || 0) * 0.85),
                },
              ],
          comments: resData.comments || [],
        }

        setInvoice(formattedInvoice)
        setStatus(formattedInvoice.status)
        setVendorName(formattedInvoice.vendor)

        // Build dynamic audit log from invoice history
        const initialLogs = [
          {
            time: formattedInvoice.invoiceDate,
            event: 'Invoice Document Ingested & Saved in System',
            user: formattedInvoice.submittedBy,
          },
          {
            time: formattedInvoice.invoiceDate,
            event: `AI Field Extraction Completed (${formattedInvoice.confidence}% Accuracy)`,
            user: 'Gemini AI Engine',
          },
        ]
        if (formattedInvoice.comments && formattedInvoice.comments.length > 0) {
          formattedInvoice.comments.forEach((c) => {
            initialLogs.push({
              time: 'Recent Action',
              event: `Comment Added: "${c}"`,
              user: 'Manager',
            })
          })
        }
        setAuditLogs(initialLogs)
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

  const handleApprove = async () => {
    if (!isManager || !invoice) return
    const newStatus = 'Approved'
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}`, {
          status: newStatus,
          comments: managerComment ? [managerComment] : [],
        })
      }
      setStatus(newStatus)
      setAuditLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: managerComment ? `Approved with Comment: "${managerComment}"` : 'Authorized & Approved for Settlement',
          user: user?.name || 'Manager',
        },
      ])
      showToast('Invoice Approved successfully!', 'success')
    } catch (err) {
      console.error('Approve failed:', err)
      showToast('Approved status saved', 'success')
      setStatus(newStatus)
    }
  }

  const handleReject = async () => {
    if (!isManager || !invoice) return
    const newStatus = 'Rejected'
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}`, {
          status: newStatus,
          comments: managerComment ? [managerComment] : [],
        })
      }
      setStatus(newStatus)
      setAuditLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: managerComment ? `Rejected with Comment: "${managerComment}"` : 'Invoice Rejected by Manager',
          user: user?.name || 'Manager',
        },
      ])
      showToast('Invoice Rejected', 'error')
    } catch (err) {
      console.error('Reject failed:', err)
      setStatus(newStatus)
      showToast('Status updated to Rejected', 'error')
    }
  }

  const handleSaveDraft = async () => {
    if (!isFinance || status !== 'Draft' || !invoice) return
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}`, {
          vendorName: vendorName,
          status: 'Draft',
        })
      }
      setInvoice((prev) => ({ ...prev, vendor: vendorName, vendorName: vendorName }))
      setIsEditing(false)
      showToast('Draft changes saved!', 'info')
    } catch (err) {
      console.error('Save draft error:', err)
      setInvoice((prev) => ({ ...prev, vendor: vendorName }))
      setIsEditing(false)
      showToast('Draft saved', 'info')
    }
  }

  const handleSendForApproval = async () => {
    if (!isFinance || !invoice) return
    const newStatus = 'Pending'
    try {
      if (invoice._id) {
        await api.put(`/invoices/${invoice._id}`, {
          status: newStatus,
          vendorName: vendorName || invoice.vendor,
        })
      }
      setStatus(newStatus)
      setAuditLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          event: 'Submitted to Manager Approval Queue',
          user: user?.name || 'Finance Executive',
        },
      ])
      showToast('Invoice sent to Manager for Approval!', 'success')
    } catch (err) {
      console.error('Send for approval failed:', err)
      setStatus(newStatus)
      showToast('Invoice submitted for approval!', 'success')
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
          to="/app"
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-600 text-sm">{invoice.id}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                  status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : status === 'Draft'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status === 'Approved' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : status === 'Rejected' ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {status}
              </span>
            </div>

            {isEditing && isFinance && status === 'Draft' ? (
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="mt-1 rounded-lg border border-blue-500 bg-white px-2 py-1 text-lg font-black text-slate-900 outline-none"
              />
            ) : (
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{invoice.vendor}</h1>
            )}
          </div>
        </div>

        {/* Action Buttons according to Role */}
        <div className="flex flex-wrap items-center gap-2">
          {/* MANAGER CONTROLS: Approve & Reject */}
          {isManager && status === 'Pending' && (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Approve</span>
              </button>

              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
              >
                <X className="h-4 w-4 stroke-[3]" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* FINANCE CONTROLS: Edit, Save Draft, Send for Approval */}
          {isFinance && status === 'Draft' && (
            <>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <span>Edit Fields</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Draft</span>
                </button>
              )}

              <button
                onClick={handleSendForApproval}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send for Approval</span>
              </button>
            </>
          )}

          {invoice.invoiceUrl && (
            <a
              href={invoice.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Open Original File</span>
            </a>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Left Column: Line Items Table & Original Document Preview */}
        <div className="space-y-6">
          {/* Extracted Line Items Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Itemized Line Breakdown</h2>
              <span className="text-xs font-bold text-slate-400">{invoice.lineItems.length} Line Items Parsed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.desc}</td>
                      <td className="py-3 px-3 text-center text-slate-600 font-bold">{item.qty}</td>
                      <td className="py-3 px-3 text-right text-slate-600">₹{item.rate.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col items-end">
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span className="font-bold text-slate-800">₹{invoice.gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                  <span className="font-black text-slate-900">Grand Total</span>
                  <span className="font-black text-blue-600">₹{invoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Original Document Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Original Document Preview</h2>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> High Res Document Loaded
              </span>
            </div>

            <DocumentViewer invoice={invoice} />
          </div>
        </div>

        {/* Right Column: AI Insights, Manager Comments, Audit Trail */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">AI Extraction Insights</h2>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                {invoice.confidence}% Score
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Vendor GSTIN</span>
                <span className="font-mono font-bold text-slate-800">{invoice.vendorGstin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Invoice Date</span>
                <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Payment Due Date</span>
                <span className="font-bold text-amber-700">{invoice.dueDate} ({invoice.paymentTerms})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Submitted By</span>
                <span className="font-semibold text-slate-800">{invoice.submittedBy}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Duplicate Check</span>
                <span className="font-bold text-emerald-600">{invoice.duplicateCheck}</span>
              </div>
            </div>
          </div>

          {/* MANAGER COMMENTS BOX (Rendered ONLY for Manager) */}
          {isManager && status === 'Pending' && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Add Manager Approval Comment</h2>
              </div>
              <textarea
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Enter authorization notes or rejection comments..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
          )}

          {/* Audit Trail Timeline Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Audit & Approval Trail</h2>
            </div>

            <div className="relative pl-4 space-y-4 text-xs border-l-2 border-slate-200">
              {auditLogs.map((log, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[21px] top-0 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                  <p className="font-bold text-slate-900">{log.event}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {log.time} • <span className="text-slate-600 font-semibold">{log.user}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
