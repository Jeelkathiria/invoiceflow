import { Invoice } from '../models/Invoice.js'

/**
 * Duplicate Detection Engine
 * Searches MongoDB for potential duplicate invoice entries based on:
 * Vendor Name + Invoice Number + Invoice Amount combination
 */
export const checkDuplicateInvoice = async (vendorName, invoiceNumber, amount) => {
  if (!vendorName || !invoiceNumber) return { isDuplicate: false, matchedInvoice: null }

  try {
    // 1. Check exact combination match in MongoDB
    let duplicateMatch = await Invoice.findOne({
      vendorName: new RegExp(`^${vendorName.trim()}$`, 'i'),
      invoiceNumber: invoiceNumber.trim(),
      amount: Number(amount),
    })
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')

    if (duplicateMatch) {
      return {
        isDuplicate: true,
        matchedInvoice: {
          id: duplicateMatch._id,
          invoiceNumber: duplicateMatch.invoiceNumber,
          vendorName: duplicateMatch.vendorName,
          amount: duplicateMatch.amount,
          status: duplicateMatch.status === 'Pending' ? 'Sent for Approval' : (duplicateMatch.status || 'Sent for Approval'),
          rawStatus: duplicateMatch.status,
          sentBy: duplicateMatch.uploadedBy?.name || 'Finance Executive',
          approvedBy: duplicateMatch.approvedBy?.name || null,
          createdAt: duplicateMatch.createdAt,
        },
      }
    }

    // 2. Fallback check for exact invoice number match from same vendor
    duplicateMatch = await Invoice.findOne({
      vendorName: new RegExp(`^${vendorName.trim()}$`, 'i'),
      invoiceNumber: invoiceNumber.trim(),
    })
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')

    if (duplicateMatch) {
      return {
        isDuplicate: true,
        matchedInvoice: {
          id: duplicateMatch._id,
          invoiceNumber: duplicateMatch.invoiceNumber,
          vendorName: duplicateMatch.vendorName,
          amount: duplicateMatch.amount,
          status: duplicateMatch.status === 'Pending' ? 'Sent for Approval' : (duplicateMatch.status || 'Sent for Approval'),
          rawStatus: duplicateMatch.status,
          sentBy: duplicateMatch.uploadedBy?.name || 'Finance Executive',
          approvedBy: duplicateMatch.approvedBy?.name || null,
          createdAt: duplicateMatch.createdAt,
        },
      }
    }

    return { isDuplicate: false, matchedInvoice: null }
  } catch (error) {
    console.error('[Duplicate Checker Error]:', error.message)
    return { isDuplicate: false, matchedInvoice: null }
  }
}
