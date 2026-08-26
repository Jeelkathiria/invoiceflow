import { Invoice } from '../models/Invoice.js'

/**
 * Normalizes text by lowercasing, trimming, and stripping punctuation/symbols.
 * Example: " Gujarat-Freight_Tools, Inc. " -> "gujaratfreighttoolsinc"
 * Example: "INV-2026/001 #A" -> "inv2026001a"
 */
export function normalizeString(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * InvoiceFlow Duplicate Detection Engine
 * 
 * Rules:
 * 1. Normalize Vendor Name and Invoice Number (lowercase, trim, strip punctuation/spaces).
 * 2. Primary Duplicate Check: Matches normalized Vendor Name + normalized Invoice Number + Total Amount -> DUPLICATE
 * 3. Secondary Check: Matches normalized Vendor Name + normalized Invoice Number (Amount differs) -> POTENTIAL_DUPLICATE
 * 4. Otherwise -> NO_DUPLICATE
 * 
 * @param {string} vendorName - Vendor name from invoice
 * @param {string} invoiceNumber - Invoice number from invoice
 * @param {number} amount - Total amount from invoice
 * @param {string|null} currentInvoiceId - Mongo ID of current invoice to exclude from duplicate search
 */
export const checkDuplicateInvoice = async (vendorName, invoiceNumber, amount, currentInvoiceId = null) => {
  if (!vendorName || !invoiceNumber) {
    return {
      isDuplicate: false,
      matchType: 'NO_DUPLICATE',
      matchedInvoice: null,
    }
  }

  try {
    const normVendor = normalizeString(vendorName)
    const normInvNum = normalizeString(invoiceNumber)
    const targetAmount = Number(amount) || 0

    if (!normVendor || !normInvNum) {
      return {
        isDuplicate: false,
        matchType: 'NO_DUPLICATE',
        matchedInvoice: null,
      }
    }

    // Build MongoDB query
    const query = {}
    if (currentInvoiceId) {
      query._id = { $ne: currentInvoiceId }
    }

    // Fetch existing records from MongoDB database
    const candidateInvoices = await Invoice.find(query)
      .populate('uploadedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('paidBy', 'name email role')
      .sort({ createdAt: -1 })

    // Helper to format match payload
    const formatMatchPayload = (doc, matchType) => {
      const uploaderName = doc.uploadedBy?.name || 'Finance Executive'
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
      const currencySym = doc.currency === 'USD' || doc.currency === '$' ? '$' : '₹'

      let detailedReason = ''
      if (matchType === 'DUPLICATE') {
        if (isPaid) {
          detailedReason = `Exact Duplicate: Invoice #${doc.invoiceNumber} for ${doc.vendorName} (${currencySym}${doc.amount}) was ALREADY PAID on ${paidDateStr || dateStr} (Uploaded by ${uploaderName}).`
        } else if (isApproved) {
          detailedReason = `Exact Duplicate: Invoice #${doc.invoiceNumber} for ${doc.vendorName} (${currencySym}${doc.amount}) was ALREADY APPROVED and is in Payment Queue (Uploaded by ${uploaderName}).`
        } else {
          detailedReason = `Exact Duplicate: Invoice #${doc.invoiceNumber} for ${doc.vendorName} (${currencySym}${doc.amount}) was ALREADY SUBMITTED by ${uploaderName} on ${dateStr} (Status: ${rawStatus}).`
        }
      } else {
        detailedReason = `Potential Duplicate Warning: Invoice #${doc.invoiceNumber} from ${doc.vendorName} exists in database with a different amount (${currencySym}${doc.amount} existing vs ${currencySym}${targetAmount} new). Originally uploaded by ${uploaderName} on ${dateStr}.`
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
        matchType,
        reason: detailedReason,
        createdAt: doc.createdAt,
      }
    }

    // 1. PRIMARY CHECK: Match normalized Vendor + normalized Invoice Number + Total Amount -> DUPLICATE
    const primaryMatch = candidateInvoices.find((doc) => {
      const dbNormVendor = normalizeString(doc.vendorName)
      const dbNormInvNum = normalizeString(doc.invoiceNumber)
      const dbAmount = Number(doc.amount || doc.totalAmount || 0)

      return dbNormVendor === normVendor && dbNormInvNum === normInvNum && dbAmount === targetAmount
    })

    if (primaryMatch) {
      return {
        isDuplicate: true,
        matchType: 'DUPLICATE',
        matchedInvoice: formatMatchPayload(primaryMatch, 'DUPLICATE'),
      }
    }

    // 2. SECONDARY CHECK: Match normalized Vendor + normalized Invoice Number (Amount differs) -> POTENTIAL_DUPLICATE
    const secondaryMatch = candidateInvoices.find((doc) => {
      const dbNormVendor = normalizeString(doc.vendorName)
      const dbNormInvNum = normalizeString(doc.invoiceNumber)

      return dbNormVendor === normVendor && dbNormInvNum === normInvNum
    })

    if (secondaryMatch) {
      return {
        isDuplicate: true,
        matchType: 'POTENTIAL_DUPLICATE',
        matchedInvoice: formatMatchPayload(secondaryMatch, 'POTENTIAL_DUPLICATE'),
      }
    }

    // 3. NO MATCH
    return {
      isDuplicate: false,
      matchType: 'NO_DUPLICATE',
      matchedInvoice: null,
    }
  } catch (error) {
    console.error('[Duplicate Checker Error]:', error.message)
    return {
      isDuplicate: false,
      matchType: 'NO_DUPLICATE',
      matchedInvoice: null,
    }
  }
}
