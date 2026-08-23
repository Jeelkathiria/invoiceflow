import { Invoice } from '../models/Invoice.js'
import { ApprovalLog } from '../models/ApprovalLog.js'
import { User } from '../models/User.js'

export const getDashboardStats = async ({ user, timeframe, startDate, endDate }) => {
  const query = {}

  // DATA ISOLATION: If Finance user, restrict queries ONLY to invoices uploaded by that user
  const isFinance = user && (user.role || '').toLowerCase().includes('finance')
  if (isFinance) {
    query.uploadedBy = user._id || user.id
  }

  // Date range filtering
  if (timeframe) {
    const now = new Date()
    let fromDate = null
    if (timeframe === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (timeframe === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeframe === 'month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (timeframe === 'last30') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (timeframe === 'custom' && startDate) {
      fromDate = new Date(startDate)
    }

    if (fromDate) {
      query.createdAt = { $gte: fromDate }
      if (timeframe === 'custom' && endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }
  }

  const totalCount = await Invoice.countDocuments(query)
  const draftCount = await Invoice.countDocuments({ ...query, status: { $in: ['Draft', 'DRAFT'] } })
  const pendingCount = await Invoice.countDocuments({ ...query, status: { $in: ['Pending', 'PENDING_APPROVAL', 'RESUBMITTED'] } })
  const approvedCount = await Invoice.countDocuments({ ...query, status: { $in: ['Approved', 'APPROVED'] } })
  const paymentQueueCount = await Invoice.countDocuments({ ...query, status: 'PAYMENT_QUEUE' })
  const paidCount = await Invoice.countDocuments({ ...query, status: { $in: ['Paid', 'PAID'] } })
  const rejectedCount = await Invoice.countDocuments({ ...query, status: { $in: ['Rejected', 'REJECTED', 'NEEDS_CORRECTION'] } })
  const duplicateCount = await Invoice.countDocuments({ ...query, duplicate: true })

  // Aggregations
  const totalAmountAgg = await Invoice.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' }, avgConfidence: { $avg: '$confidenceScore' } } },
  ])

  const paymentQueueAmountAgg = await Invoice.aggregate([
    { $match: { ...query, status: 'PAYMENT_QUEUE' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  const paidTotalAgg = await Invoice.aggregate([
    { $match: { ...query, status: { $in: ['Paid', 'PAID'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  // Paid this month calculation
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const paidThisMonthAgg = await Invoice.aggregate([
    { $match: { ...query, status: { $in: ['Paid', 'PAID'] }, $or: [{ paidAt: { $gte: startOfMonth } }, { updatedAt: { $gte: startOfMonth } }] } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ])

  // Due Soon & Overdue calculation for Payment Queue
  const queueInvoices = await Invoice.find({ ...query, status: 'PAYMENT_QUEUE' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let dueSoonCount = 0
  let overdueCount = 0
  let dueSoonAmount = 0
  let overdueAmount = 0
  let scheduledAmount = 0

  queueInvoices.forEach((inv) => {
    const amt = Number(inv.amount || 0)
    if (inv.dueDate && !isNaN(new Date(inv.dueDate).getTime())) {
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) {
        overdueCount++
        overdueAmount += amt
      } else if (diffDays <= 7) {
        dueSoonCount++
        dueSoonAmount += amt
      } else {
        scheduledAmount += amt
      }
    } else {
      scheduledAmount += amt
    }
  })

  const totalAmount = totalAmountAgg[0]?.total || 0
  const paymentQueueAmount = paymentQueueAmountAgg[0]?.total || 0
  const paidTotalAmount = paidTotalAgg[0]?.total || 0
  const paidThisMonthAmount = paidThisMonthAgg[0]?.total || 0
  const paidThisMonthCount = paidThisMonthAgg[0]?.count || 0
  const avgConfidence = Math.round((totalAmountAgg[0]?.avgConfidence || 96.5) * 10) / 10

  return {
    totalInvoices: totalCount,
    draftCount,
    pendingApprovals: pendingCount,
    approvedInvoices: approvedCount,
    rejectedInvoices: rejectedCount,
    duplicateAlerts: duplicateCount,
    totalVolumeAmount: totalAmount,
    aiConfidenceScore: avgConfidence,
    paymentQueueCount,
    paymentQueueAmount,
    paidCount,
    paidTotalAmount,
    dueSoonCount,
    dueSoonAmount,
    overdueCount,
    overdueAmount,
    scheduledAmount,
    paidThisMonthCount,
    paidThisMonthAmount,
  }
}

export const getRecentUploads = async ({ user, limit = 5 }) => {
  const query = {}
  const isFinance = user && (user.role || '').toLowerCase().includes('finance')
  if (isFinance) {
    query.uploadedBy = user._id || user.id
  }

  return await Invoice.find(query)
    .populate('uploadedBy', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(limit)
}

export const getActivityTimeline = async ({ user, limit = 10 }) => {
  const isFinance = user && (user.role || '').toLowerCase().includes('finance')
  let query = {}

  if (isFinance) {
    query = { performedBy: user._id || user.id }
  }

  return await ApprovalLog.find(query)
    .populate('performedBy', 'name email role avatar')
    .populate('invoiceId', 'invoiceNumber vendorName amount currency status')
    .sort({ timestamp: -1 })
    .limit(limit)
}

export const getFinanceTeamOverview = async () => {
  const financeUsers = await User.find({ role: { $in: ['finance', 'Finance'] } }).select('name email avatar role')

  const teamOverview = await Promise.all(
    financeUsers.map(async (fUser) => {
      const uId = fUser._id
      const invoices = await Invoice.countDocuments({ uploadedBy: uId })
      const pending = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Pending', 'PENDING_APPROVAL', 'RESUBMITTED'] } })
      const approved = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Approved', 'APPROVED'] } })
      const rejected = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Rejected', 'REJECTED', 'NEEDS_CORRECTION'] } })
      const paymentQueue = await Invoice.countDocuments({ uploadedBy: uId, status: 'PAYMENT_QUEUE' })
      const paid = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Paid', 'PAID'] } })

      const amountAgg = await Invoice.aggregate([
        { $match: { uploadedBy: uId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])

      return {
        user: {
          _id: fUser._id,
          name: fUser.name,
          email: fUser.email,
          avatar: fUser.avatar,
          role: 'Finance',
        },
        invoices,
        pending,
        approved,
        rejected,
        paymentQueue,
        paid,
        totalValue: amountAgg[0]?.total || 0,
      }
    })
  )

  return teamOverview
}

export const getNeedsAttentionInvoices = async (limit = 10) => {
  return await Invoice.find({
    $or: [
      { status: { $in: ['Pending', 'PENDING_APPROVAL', 'RESUBMITTED'] } },
      { duplicate: true },
      { confidenceScore: { $lt: 80 } },
      { amount: { $gte: 100000 } },
    ],
  })
    .populate('uploadedBy', 'name email avatar role')
    .sort({ duplicate: -1, amount: -1, createdAt: 1 })
    .limit(limit)
}

export const getRiskOverview = async () => {
  const duplicateInvoices = await Invoice.countDocuments({ duplicate: true })
  const lowConfidenceCount = await Invoice.countDocuments({ confidenceScore: { $lt: 80 } })
  const highValueCount = await Invoice.countDocuments({ amount: { $gte: 100000 } })

  const queueInvoices = await Invoice.find({ status: 'PAYMENT_QUEUE' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let overduePayments = 0

  queueInvoices.forEach((inv) => {
    if (inv.dueDate && !isNaN(new Date(inv.dueDate).getTime())) {
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      if (due.getTime() < today.getTime()) {
        overduePayments++
      }
    }
  })

  return {
    duplicateInvoices,
    missingFields: lowConfidenceCount,
    validationErrors: lowConfidenceCount,
    highValueInvoices: highValueCount,
    overduePayments,
  }
}

export const getAIInsights = async () => {
  const pendingInvoices = await Invoice.find({ status: { $in: ['Pending', 'PENDING_APPROVAL', 'RESUBMITTED'] } })
  const duplicates = await Invoice.find({ duplicate: true })
  const pendingTotal = pendingInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0)

  const vendorAgg = await Invoice.aggregate([
    { $group: { _id: '$vendorName', totalSpend: { $sum: '$amount' } } },
    { $sort: { totalSpend: -1 } },
    { $limit: 1 },
  ])

  return {
    topInsights: [
      {
        id: '1',
        type: 'warning',
        title: `${duplicates.length} Duplicate Invoices Detected`,
        description: 'Verify vendor tax IDs and PO numbers before authorizing payment.',
      },
      {
        id: '2',
        type: 'info',
        title: `Pending Approval Volume: ${pendingInvoices.length}`,
        description: `Total pending amount awaiting Manager action is ₹${pendingTotal.toLocaleString('en-IN')}.`,
      },
      {
        id: '3',
        type: 'success',
        title: `Top Vendor Spend: ${vendorAgg[0]?._id || 'N/A'}`,
        description: `Largest vendor volume recorded is ₹${(vendorAgg[0]?.totalSpend || 0).toLocaleString('en-IN')}.`,
      },
    ],
  }
}
