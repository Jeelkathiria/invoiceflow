import { User } from '../models/User.js'
import { Invoice } from '../models/Invoice.js'
import { ApprovalLog } from '../models/ApprovalLog.js'

export const getFinanceTeamList = async () => {
  const financeUsers = await User.find({ role: { $in: ['finance', 'Finance'] } })
    .select('name email avatar role createdAt')
    .sort({ createdAt: -1 })

  const teamList = await Promise.all(
    financeUsers.map(async (fUser) => {
      const uId = fUser._id

      const totalInvoices = await Invoice.countDocuments({ uploadedBy: uId })
      const pending = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Pending', 'PENDING_APPROVAL'] } })
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
          createdAt: fUser.createdAt,
        },
        totalInvoices,
        pending,
        approved,
        rejected,
        paymentQueue,
        paid,
        totalValue: amountAgg[0]?.total || 0,
      }
    })
  )

  return teamList
}

export const getFinanceMemberDetails = async (userId) => {
  const user = await User.findById(userId).select('name email avatar role createdAt')
  if (!user) {
    throw new Error('Finance executive not found')
  }

  const uId = user._id

  // 1. KPI Stats for ONLY this Finance Executive
  const totalInvoices = await Invoice.countDocuments({ uploadedBy: uId })
  const pending = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Pending', 'PENDING_APPROVAL'] } })
  const approved = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Approved', 'APPROVED'] } })
  const rejected = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Rejected', 'REJECTED', 'NEEDS_CORRECTION'] } })
  const paymentQueue = await Invoice.countDocuments({ uploadedBy: uId, status: 'PAYMENT_QUEUE' })
  const paid = await Invoice.countDocuments({ uploadedBy: uId, status: { $in: ['Paid', 'PAID'] } })

  const amountAgg = await Invoice.aggregate([
    { $match: { uploadedBy: uId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const totalValue = amountAgg[0]?.total || 0

  // 2. Payment Summary for ONLY this Finance Executive
  const queueInvoices = await Invoice.find({ uploadedBy: uId, status: 'PAYMENT_QUEUE' })
  const paymentQueueValue = queueInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next7Days = new Date(today)
  next7Days.setDate(next7Days.getDate() + 7)

  let dueSoonAmount = 0
  let overdueAmount = 0

  queueInvoices.forEach((inv) => {
    if (inv.dueDate && !isNaN(new Date(inv.dueDate).getTime())) {
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      if (due.getTime() < today.getTime()) {
        overdueAmount += inv.amount || 0
      } else if (due.getTime() <= next7Days.getTime()) {
        dueSoonAmount += inv.amount || 0
      }
    }
  })

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const paidInvoices = await Invoice.find({
    uploadedBy: uId,
    status: { $in: ['Paid', 'PAID'] },
    $or: [
      { paidAt: { $gte: startOfMonth } },
      { updatedAt: { $gte: startOfMonth } }
    ]
  })
  const paidThisMonthAmount = paidInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0)

  // 3. Monthly Invoice Analytics (Spend & Count) for ONLY this user
  const userInvoices = await Invoice.find({ uploadedBy: uId })
  const monthsMap = {
    Jan: { month: 'Jan', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Feb: { month: 'Feb', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Mar: { month: 'Mar', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Apr: { month: 'Apr', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    May: { month: 'May', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Jun: { month: 'Jun', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Jul: { month: 'Jul', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Aug: { month: 'Aug', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Sep: { month: 'Sep', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Oct: { month: 'Oct', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Nov: { month: 'Nov', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
    Dec: { month: 'Dec', value: 0, count: 0, paid: 0, approved: 0, pending: 0 },
  }

  userInvoices.forEach((inv) => {
    const rawAmt = Number(inv.amount || inv.totalAmount || 0) || 0
    const d = inv.createdAt ? new Date(inv.createdAt) : new Date()
    const monthKey = d.toLocaleString('en-US', { month: 'short' })
    if (monthsMap[monthKey]) {
      monthsMap[monthKey].value += rawAmt
      monthsMap[monthKey].count += 1
      const st = inv.status
      if (st === 'Paid' || st === 'PAID') {
        monthsMap[monthKey].paid += rawAmt
      } else if (st === 'Approved' || st === 'APPROVED' || st === 'PAYMENT_QUEUE') {
        monthsMap[monthKey].approved += rawAmt
      } else {
        monthsMap[monthKey].pending += rawAmt
      }
    }
  })

  const monthlyAnalytics = Object.values(monthsMap)

  // 4. Status Distribution for Donut Chart
  const statusDistribution = [
    { name: 'Pending Approval', count: pending, color: '#f59e0b' },
    { name: 'Approved', count: approved, color: '#10b981' },
    { name: 'Rejected', count: rejected, color: '#ef4444' },
    { name: 'Payment Queue', count: paymentQueue, color: '#2563eb' },
    { name: 'Paid', count: paid, color: '#059669' },
  ]

  // 5. Recent Invoices
  const recentInvoices = await Invoice.find({ uploadedBy: uId })
    .sort({ createdAt: -1 })
    .limit(15)

  // 6. Recent Activity Logs
  const userInvoiceIds = userInvoices.map((i) => i._id)
  const recentActivity = await ApprovalLog.find({
    $or: [
      { performedBy: uId },
      { invoiceId: { $in: userInvoiceIds } }
    ]
  })
    .populate('performedBy', 'name email avatar role')
    .populate('invoiceId', 'invoiceNumber vendorName amount currency status')
    .sort({ timestamp: -1, createdAt: -1 })
    .limit(15)

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: 'Finance',
      createdAt: user.createdAt,
    },
    stats: {
      totalInvoices,
      pending,
      approved,
      rejected,
      paymentQueue,
      paid,
      totalValue,
    },
    paymentSummary: {
      paymentQueueValue,
      dueSoonAmount,
      overdueAmount,
      paidThisMonthAmount,
    },
    monthlyAnalytics,
    statusDistribution: {
      items: statusDistribution,
      totalCount: totalInvoices,
    },
    recentInvoices,
    recentActivity,
  }
}
