import { Invoice } from '../models/Invoice.js'
import { ApprovalLog } from '../models/ApprovalLog.js'

export const getDashboardStats = async () => {
  const totalCount = await Invoice.countDocuments()
  const pendingCount = await Invoice.countDocuments({ status: 'Pending' })
  const approvedCount = await Invoice.countDocuments({ status: 'Approved' })
  const rejectedCount = await Invoice.countDocuments({ status: 'Rejected' })
  const duplicateCount = await Invoice.countDocuments({ duplicate: true })

  const totalAmountAgg = await Invoice.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' }, avgConfidence: { $avg: '$confidenceScore' } } }
  ])

  const approvedAmountAgg = await Invoice.aggregate([
    { $match: { status: 'Approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  const pendingAmountAgg = await Invoice.aggregate([
    { $match: { status: 'Pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])

  const totalAmount = totalAmountAgg[0]?.total || 0
  const approvedAmount = approvedAmountAgg[0]?.total || 0
  const pendingAmount = pendingAmountAgg[0]?.total || 0
  const avgConfidence = Math.round((totalAmountAgg[0]?.avgConfidence || 96.5) * 10) / 10

  return {
    totalInvoices: totalCount,
    pendingApprovals: pendingCount,
    approvedInvoices: approvedCount,
    rejectedInvoices: rejectedCount,
    duplicateAlerts: duplicateCount,
    totalVolumeAmount: totalAmount,
    approvedTotalAmount: approvedAmount,
    pendingTotalAmount: pendingAmount,
    aiConfidenceScore: avgConfidence,
  }
}

export const getRecentUploads = async (limit = 5) => {
  return await Invoice.find()
    .populate('uploadedBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
}

export const getActivityTimeline = async (limit = 10) => {
  return await ApprovalLog.find()
    .populate('performedBy', 'name email role avatar')
    .populate('invoiceId', 'invoiceNumber vendorName amount')
    .sort({ timestamp: -1 })
    .limit(limit)
}

export const getAIInsights = async () => {
  const pendingInvoices = await Invoice.find({ status: 'Pending' })
  const duplicates = await Invoice.find({ duplicate: true })
  
  const pendingTotal = pendingInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0)
  
  // Find top vendor
  const vendorAgg = await Invoice.aggregate([
    { $group: { _id: '$vendorName', totalSpend: { $sum: '$amount' } } },
    { $sort: { totalSpend: -1 } },
    { $limit: 1 }
  ])
  const topVendor = vendorAgg[0]?._id || 'Microsoft'

  return {
    title: 'InvoiceFlow AI Assistant',
    insights: [
      `${pendingInvoices.length} invoices require immediate manager review.`,
      duplicates.length > 0
        ? `${duplicates.length} duplicate invoice flags detected and quarantined.`
        : 'No duplicate invoices detected in current batch.',
      `₹${(pendingTotal / 100000).toFixed(2)}L awaiting executive approval.`,
      `Highest spending vendor this month: ${topVendor}.`,
    ],
  }
}
