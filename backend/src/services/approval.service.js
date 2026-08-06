import { Invoice } from '../models/Invoice.js'
import { ApprovalLog } from '../models/ApprovalLog.js'
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'

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

  // Create Notification specifically for Finance users with Manager name
  try {
    let managerName = 'Manager'
    if (userId) {
      const manager = await User.findById(userId)
      if (manager?.name) managerName = manager.name
    }
    const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'

    await Notification.create({
      title: 'Invoice Approved',
      message: `${managerName} approved Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} (${sym}${(invoice.amount || 0).toLocaleString()}).`,
      type: 'success',
      link: '/app/invoices',
      recipientRole: 'finance',
      user: invoice.uploadedBy || null,
    })
  } catch (err) {
    console.warn('[Notification Error]:', err.message)
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

  const reason = (comment || '').trim() || 'No specific reason provided'

  invoice.status = 'Rejected'
  invoice.rejectionReason = reason
  invoice.approvedBy = userId
  await invoice.save()

  // Create Audit Log
  const log = await ApprovalLog.create({
    invoiceId: invoice._id,
    performedBy: userId,
    action: 'Rejected',
    comment: reason,
  })

  // Create Notification specifically for Finance users with Manager name
  try {
    let managerName = 'Manager'
    if (userId) {
      const manager = await User.findById(userId)
      if (manager?.name) managerName = manager.name
    }

    await Notification.create({
      title: 'Invoice Rejected',
      message: `${managerName} rejected Invoice #${invoice.invoiceNumber}. Reason: "${reason}"`,
      type: 'danger',
      link: `/app/invoice/${invoice._id}`,
      recipientRole: 'finance',
      user: invoice.uploadedBy || null,
    })
  } catch (err) {
    console.warn('[Notification Error]:', err.message)
  }

  return { invoice, log }
}
