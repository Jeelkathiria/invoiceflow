import { Invoice } from '../models/Invoice.js'
import { ApprovalLog } from '../models/ApprovalLog.js'
import { Notification } from '../models/Notification.js'

export const getPendingApprovals = async () => {
  return await Invoice.find({ status: 'Pending' })
    .populate('uploadedBy', 'name email role avatar')
    .sort({ createdAt: -1 })
}

export const approveInvoice = async (invoiceId, userId, comment = '') => {
  const invoice = await Invoice.findById(invoiceId)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  invoice.status = 'Approved'
  invoice.approvedBy = userId
  await invoice.save()

  // Create Audit Log
  const log = await ApprovalLog.create({
    invoiceId: invoice._id,
    performedBy: userId,
    action: 'Approved',
    comment: comment || 'Invoice approved for settlement',
  })

  // Create Notification for the uploader
  if (invoice.uploadedBy) {
    await Notification.create({
      title: 'Invoice Approved',
      message: `Invoice ${invoice.invoiceNumber} for ₹${invoice.amount.toLocaleString()} was approved.`,
      user: invoice.uploadedBy,
    })
  }

  return { invoice, log }
}

export const rejectInvoice = async (invoiceId, userId, comment = '') => {
  const invoice = await Invoice.findById(invoiceId)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  invoice.status = 'Rejected'
  invoice.approvedBy = userId
  await invoice.save()

  // Create Audit Log
  const log = await ApprovalLog.create({
    invoiceId: invoice._id,
    performedBy: userId,
    action: 'Rejected',
    comment: comment || 'Invoice rejected by manager',
  })

  // Create Notification for the uploader
  if (invoice.uploadedBy) {
    await Notification.create({
      title: 'Invoice Rejected',
      message: `Invoice ${invoice.invoiceNumber} was rejected. Reason: ${comment || 'No comment provided'}`,
      user: invoice.uploadedBy,
    })
  }

  return { invoice, log }
}
