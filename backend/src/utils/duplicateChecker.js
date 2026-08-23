import { Invoice } from '../models/Invoice.js'

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Duplicate Detection Engine
 * Searches MongoDB for potential duplicate invoice entries based on:
 * Vendor Name + Invoice Number + Invoice Amount combination
 */
export const checkDuplicateInvoice = async (vendorName, invoiceNumber, amount) => {
  if (!vendorName || !invoiceNumber) return { isDuplicate: false, matchedInvoice: null }

  try {
    const escapedVendor = escapeRegExp(vendorName.trim())
    const escapedInvNum = String(invoiceNumber).trim()

    // Helper to format detailed match result
    const formatMatchPayload = (doc) => {
      const uploaderName = 'Finance Executive'
      const rawStatus = doc.status || 'Pending'
      const isPaid = rawStatus === 'Paid' || rawStatus === 'PAID'
      const isApproved = rawStatus === 'Approved' || rawStatus === 'APPROVED' || rawStatus === 'PAYMENT_QUEUE'
      
      let statusResultLabel = 'ALREADY SUBMITTED & PENDING APPROVAL'
      if (isPaid) {
        statusResultLabel = 'WAS ALREADY PAID'
      } else if (isApproved) {
        statusResultLabel = 'WAS ALREADY APPROVED (IN PAYMENT QUEUE)'
      } else if (rawStatus === 'Rejected') {
        statusResultLabel = 'PREVIOUSLY REJECTED'
      }

      const dateStr = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''
      const paidDateStr = doc.paidAt ? new Date(doc.paidAt).toLocaleDateString() : ''

      let detailedReason = `Duplicate invoice detected. Original Invoice #${doc.invoiceNumber} for ${doc.vendorName} (${doc.currency || '₹'}${doc.amount || 0}) was submitted by ${uploaderName} on ${dateStr}.`
      
      if (isPaid) {
        detailedReason = `This invoice WAS ALREADY PAID on ${paidDateStr || dateStr}. It was originally submitted by ${uploaderName}.`
      } else if (isApproved) {
        detailedReason = `This invoice WAS ALREADY APPROVED and is currently in the Payment Queue. It was originally submitted by ${uploaderName}.`
      } else {
        detailedReason = `This invoice WAS ALREADY SUBMITTED by ${uploaderName} on ${dateStr} and is currently ${rawStatus}.`
      }

      return {
        id: doc._id,
        invoiceNumber: doc.invoiceNumber,
        vendorName: doc.vendorName,
        amount: doc.amount,
        status: statusResultLabel,
        rawStatus: doc.status,
        sentBy: uploaderName,
        submittedBy: uploaderName,
        approvedBy: doc.approvedBy?.name || null,
        paidBy: doc.paidBy?.name || null,
        paidAt: doc.paidAt || null,
        reason: detailedReason,
        createdAt: doc.createdAt,
      }
    }

    // 1. Check exact combination match in MongoDB (Vendor + Inv Number + Amount)
    let duplicateMatch = await Invoice.findOne({
      vendorName: new RegExp(`^${escapedVendor}$`, 'i'),
      invoiceNumber: escapedInvNum,
      amount: Number(amount),
    })
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('paidBy', 'name email role')

    if (duplicateMatch) {
      return {
        isDuplicate: true,
        matchedInvoice: formatMatchPayload(duplicateMatch),
      }
    }

    // 2. Fallback check for exact invoice number match from same vendor
    duplicateMatch = await Invoice.findOne({
      vendorName: new RegExp(`^${escapedVendor}$`, 'i'),
      invoiceNumber: escapedInvNum,
    })
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('paidBy', 'name email role')

    if (duplicateMatch) {
      return {
        isDuplicate: true,
        matchedInvoice: formatMatchPayload(duplicateMatch),
      }
    }

    return { isDuplicate: false, matchedInvoice: null }
  } catch (error) {
    console.error('[Duplicate Checker Error]:', error.message)
    return { isDuplicate: false, matchedInvoice: null }
  }
}

