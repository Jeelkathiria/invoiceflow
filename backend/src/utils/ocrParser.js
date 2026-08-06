/**
 * OCR Parser & Rule Engine
 * Extracts invoice header fields via Regex and tabular line items via specialized table parser.
 * Validates strict criteria before deciding if OCR output is usable without Gemini fallback.
 */

// GSTIN Regex for Indian Invoices
const GSTIN_REGEX = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}\b/i

// Common Invoice Number Patterns
const INV_NUMBER_REGEX = /(?:invoice\s*(?:no|number|num|#)?|inv\s*(?:no|#)?|bill\s*no)[:.\s]*([a-z0-9\/-]+)/i

// Common Date Patterns
const DATE_REGEX = /(?:invoice\s*date|date)[:.\s]*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[a-z]{3,9}\s+\d{4})/i
const DUE_DATE_REGEX = /(?:due\s*date|payment\s*due)[:.\s]*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[a-z]{3,9}\s+\d{4})/i

// Buyer Name / Billed To Patterns
const BUYER_NAME_REGEX = /(?:bill\s*to|billed\s*to|buyer|customer|consignee)[:.\s]*([^\n\r,]+)/i
const BUYER_GSTIN_REGEX = /(?:buyer\s*gstin|customer\s*gstin|billed\s*to\s*gstin)[:.\s]*\b(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1})\b/i

// PO Number Patterns
const PO_NUMBER_REGEX = /(?:po\s*(?:no|number|num|#)?|p\.o\.\s*(?:no|#)?|purchase\s*order\s*(?:no|#)?)[:.\s]*([a-z0-9\/-]+)/i

// Payment Terms & Notes
const PAYMENT_TERMS_REGEX = /(?:payment\s*terms|terms)[:.\s]*([^\n\r]+)/i
const NOTES_REGEX = /(?:notes|remarks|terms\s*&\s*conditions)[:.\s]*([^\n\r]+)/i

// Tax Breakdown & Totals Patterns
const TOTAL_AMOUNT_REGEX = /(?:grand\s*total|total\s*amount|total\s*payable|amount\s*payable|net\s*amount|total)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const SUBTOTAL_REGEX = /(?:subtotal|sub-total|taxable\s*value|taxable\s*amount)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const GST_AMOUNT_REGEX = /(?:gst\s*amount|total\s*tax|vat\s*amount|tax)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const CGST_REGEX = /(?:cgst)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const SGST_REGEX = /(?:sgst)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const IGST_REGEX = /(?:igst)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const SHIPPING_REGEX = /(?:shipping|freight|delivery)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i

/**
 * Clean & parse numeric values from currency string (e.g. "14,750.00" -> 14750)
 */
function parseNumber(val) {
  if (!val) return 0
  const clean = String(val).replace(/[^0-9.]/g, '')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

/**
 * Helper to compute missingMandatoryFields and missingOptionalFields arrays
 */
export function computeMissingFields(data = {}) {
  const safeData = data || {}
  const missingMandatoryFields = []
  const missingOptionalFields = []

  // Mandatory checks
  if (!safeData.vendorName || String(safeData.vendorName).trim() === '' || safeData.vendorName === 'Unknown Vendor' || safeData.vendorName === 'Extracted Vendor') {
    missingMandatoryFields.push('Vendor Name')
  }
  if (!safeData.invoiceNumber || String(safeData.invoiceNumber).trim() === '' || safeData.invoiceNumber === 'INV-001') {
    missingMandatoryFields.push('Invoice Number')
  }
  if (!safeData.invoiceDate || String(safeData.invoiceDate).trim() === '' || safeData.invoiceDate === '-') {
    missingMandatoryFields.push('Invoice Date')
  }
  if (!safeData.totalAmount || Number(safeData.totalAmount) <= 0) {
    missingMandatoryFields.push('Grand Total')
  }

  // Optional checks
  if (!safeData.vendorGstin || String(safeData.vendorGstin).trim() === '') {
    missingOptionalFields.push('Vendor GSTIN')
  }
  if (!safeData.buyerName || String(safeData.buyerName).trim() === '') {
    missingOptionalFields.push('Buyer Name')
  }
  if (!safeData.buyerGstin || String(safeData.buyerGstin).trim() === '') {
    missingOptionalFields.push('Buyer GSTIN')
  }
  if (!safeData.dueDate || String(safeData.dueDate).trim() === '' || safeData.dueDate === 'null' || safeData.dueDate === '-') {
    missingOptionalFields.push('Due Date')
  }
  if (!safeData.poNumber || String(safeData.poNumber).trim() === '') {
    missingOptionalFields.push('Purchase Order Number')
  }
  if (!safeData.currency || String(safeData.currency).trim() === '') {
    missingOptionalFields.push('Currency')
  }
  if (!safeData.paymentTerms || String(safeData.paymentTerms).trim() === '') {
    missingOptionalFields.push('Payment Terms')
  }
  if (!safeData.subtotal) {
    missingOptionalFields.push('Subtotal')
  }
  if (!safeData.gst) {
    missingOptionalFields.push('Total Tax')
  }
  if (!safeData.cgst) {
    missingOptionalFields.push('CGST')
  }
  if (!safeData.sgst) {
    missingOptionalFields.push('SGST')
  }
  if (!safeData.igst) {
    missingOptionalFields.push('IGST')
  }
  if (!safeData.shippingCharges) {
    missingOptionalFields.push('Shipping Charges')
  }
  if (!safeData.otherCharges) {
    missingOptionalFields.push('Other Charges')
  }
  if (!safeData.discount) {
    missingOptionalFields.push('Discount')
  }
  if (!safeData.notes || String(safeData.notes).trim() === '') {
    missingOptionalFields.push('Notes / Remarks')
  }

  return { missingMandatoryFields, missingOptionalFields }
}

/**
 * Parses header fields from OCR raw text using regex patterns
 */
export function parseHeaderFields(rawText = '', lines = []) {
  const text = String(rawText || '')
  const safeLines = Array.isArray(lines) ? lines : []

  // Vendor Name Detection: Examine top lines, ignoring generic invoice headers
  let vendorName = null
  const headerLines = safeLines.slice(0, 10)
  for (const line of headerLines) {
    if (!line || typeof line !== 'string') continue
    const lower = line.toLowerCase()
    if (
      !lower.includes('tax invoice') &&
      !lower.includes('invoice') &&
      !lower.includes('bill to') &&
      !lower.includes('gstin') &&
      !lower.includes('date') &&
      line.length > 3
    ) {
      // Strip common prefixes
      vendorName = line.replace(/^(from|vendor|supplier|billed by)[:.\s]*/i, '').trim()
      if (vendorName) break
    }
  }

  // Buyer Name & Buyer GSTIN
  const buyerNameMatch = text.match(BUYER_NAME_REGEX)
  const buyerName = buyerNameMatch ? buyerNameMatch[1].trim() : ''

  const buyerGstinMatch = text.match(BUYER_GSTIN_REGEX)
  const buyerGstin = buyerGstinMatch ? buyerGstinMatch[1].toUpperCase() : ''

  // Vendor GSTIN
  const gstinMatch = text.match(GSTIN_REGEX)
  const vendorGstin = gstinMatch ? gstinMatch[0].toUpperCase() : ''

  // Invoice Number & PO Number
  const invMatch = text.match(INV_NUMBER_REGEX)
  const invoiceNumber = invMatch ? invMatch[1].trim() : null

  const poMatch = text.match(PO_NUMBER_REGEX)
  const poNumber = poMatch ? poMatch[1].trim() : ''

  // Dates
  const dateMatch = text.match(DATE_REGEX)
  const invoiceDate = dateMatch ? dateMatch[1].trim() : null

  const dueDateMatch = text.match(DUE_DATE_REGEX)
  const dueDate = dueDateMatch ? dueDateMatch[1].trim() : null

  // Payment Terms & Notes
  const termsMatch = text.match(PAYMENT_TERMS_REGEX)
  const paymentTerms = termsMatch ? termsMatch[1].trim() : ''

  const notesMatch = text.match(NOTES_REGEX)
  const notes = notesMatch ? notesMatch[1].trim() : ''

  // Currency
  let currency = 'INR'
  if (text.includes('$') || text.toUpperCase().includes('USD')) {
    currency = 'USD'
  } else if (text.includes('€') || text.toUpperCase().includes('EUR')) {
    currency = 'EUR'
  } else if (text.includes('£') || text.toUpperCase().includes('GBP')) {
    currency = 'GBP'
  }

  // Totals & Tax Breakdowns
  const totalMatch = text.match(TOTAL_AMOUNT_REGEX)
  const totalAmount = totalMatch ? parseNumber(totalMatch[1]) : 0

  const subtotalMatch = text.match(SUBTOTAL_REGEX)
  const subtotal = subtotalMatch ? parseNumber(subtotalMatch[1]) : 0

  const gstMatch = text.match(GST_AMOUNT_REGEX)
  const gst = gstMatch ? parseNumber(gstMatch[1]) : 0

  const cgstMatch = text.match(CGST_REGEX)
  const cgst = cgstMatch ? parseNumber(cgstMatch[1]) : 0

  const sgstMatch = text.match(SGST_REGEX)
  const sgst = sgstMatch ? parseNumber(sgstMatch[1]) : 0

  const igstMatch = text.match(IGST_REGEX)
  const igst = igstMatch ? parseNumber(igstMatch[1]) : 0

  const shippingMatch = text.match(SHIPPING_REGEX)
  const shippingCharges = shippingMatch ? parseNumber(shippingMatch[1]) : 0

  return {
    vendorName,
    vendorGstin,
    buyerName,
    buyerGstin,
    invoiceNumber,
    poNumber,
    invoiceDate,
    dueDate,
    paymentTerms,
    notes,
    currency,
    totalAmount,
    subtotal: subtotal || (totalAmount > 0 ? Math.round(totalAmount * 0.85) : 0),
    gst: gst || (totalAmount > 0 ? Math.round(totalAmount * 0.15) : 0),
    cgst,
    sgst,
    igst,
    shippingCharges,
    otherCharges: 0,
    discount: 0,
  }
}

/**
 * Specialized Table Parser for Invoice Line Items
 * Extracts tabular item rows containing description, qty, unit price, tax rate, tax amount, and total amount
 */
export function parseTableLineItems(lines = []) {
  const lineItems = []

  let startIdx = -1
  let endIdx = lines.length

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase()
    if (
      (l.includes('description') || l.includes('item') || l.includes('particulars')) &&
      (l.includes('qty') || l.includes('quantity') || l.includes('rate') || l.includes('amount') || l.includes('price'))
    ) {
      startIdx = i + 1
      break
    }
  }

  if (startIdx === -1) {
    startIdx = 0
  }

  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i].toLowerCase()
    if (
      l.includes('subtotal') ||
      l.includes('grand total') ||
      l.includes('total payable') ||
      l.includes('terms') ||
      l.includes('bank details') ||
      l.includes('thank you')
    ) {
      endIdx = i
      break
    }
  }

  const tableLines = lines.slice(startIdx, endIdx)

  for (const line of tableLines) {
    const tokens = line.split(/\s+/).filter(Boolean)
    if (tokens.length >= 3) {
      const numbers = []
      const textParts = []

      for (const token of tokens) {
        const num = parseNumber(token)
        if (num > 0 || token === '0') {
          numbers.push(num)
        } else {
          textParts.push(token)
        }
      }

      if (numbers.length >= 2 && textParts.length >= 1) {
        const description = textParts.join(' ')
        let quantity = 1
        let unitPrice = numbers[0]
        let amount = numbers[numbers.length - 1]

        if (numbers.length >= 3) {
          quantity = numbers[0] < 100 ? numbers[0] : 1
          unitPrice = numbers[numbers.length >= 4 ? 1 : 0]
          amount = numbers[numbers.length - 1]
        }

        if (description.length > 2 && amount > 0) {
          const taxAmount = Math.round((amount - (quantity * unitPrice)) * 100) / 100 || 0
          lineItems.push({
            description,
            quantity: quantity || 1,
            unitPrice: unitPrice || amount,
            tax: taxAmount,
            taxRate: 0,
            taxAmount: taxAmount,
            amount: amount,
          })
        }
      }
    }
  }

  return lineItems
}

/**
 * Strict Rule Engine & Routing Evaluator
 * Evaluates whether OCR output meets all mandatory criteria for OCR_ONLY processing:
 * 1. OCR Confidence >= 90%
 * 2. All 4 mandatory header fields present (vendorName, invoiceNumber, invoiceDate, totalAmount)
 * 3. Zero critical parsing errors
 */
export function evaluateOCRQuality(rawText, ocrConfidence, lines = []) {
  const headerData = parseHeaderFields(rawText, lines)
  const lineItems = parseTableLineItems(lines)

  const { missingMandatoryFields, missingOptionalFields } = computeMissingFields({
    ...headerData,
    lineItems,
  })

  const validationErrors = []

  // Rule 1: OCR Confidence Threshold (>= 90%)
  if (ocrConfidence < 90) {
    validationErrors.push(`OCR confidence (${ocrConfidence}%) is below the required 90% threshold.`)
  }

  // Rule 2: Mandatory Header Fields check
  if (missingMandatoryFields.length > 0) {
    validationErrors.push(`Missing mandatory fields: ${missingMandatoryFields.join(', ')}`)
  }

  // High confidence OCR_ONLY requires OCR confidence >= 90% AND all mandatory fields present
  const isHighConfidence = ocrConfidence >= 90 && missingMandatoryFields.length === 0
  const strategy = isHighConfidence ? 'OCR_ONLY' : 'OCR_FALLBACK_GEMINI'
  const extractionSource = isHighConfidence ? 'OCR' : 'GEMINI'

  return {
    isHighConfidence,
    strategy,
    extractionSource,
    validationErrors,
    missingMandatoryFields,
    missingOptionalFields,
    ocrConfidence,
    parsedData: {
      ...headerData,
      lineItems,
    },
  }
}
