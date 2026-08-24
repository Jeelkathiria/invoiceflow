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


// Payment Terms & Notes
const PAYMENT_TERMS_REGEX = /(?:payment\s*terms|terms)[:.\s]*([^\n\r]+)/i
const NOTES_REGEX = /(?:notes|remarks|terms\s*&\s*conditions)[:.\s]*([^\n\r]+)/i

// Tax Breakdown & Totals Patterns
const TOTAL_AMOUNT_REGEX = /(?:balance\s*due|grand\s*total|total\s*payable|amount\s*payable|net\s*amount|(?:(?<!sub\s*|sub-)total))[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const SUBTOTAL_REGEX = /(?:subtotal|sub-total|sub\s*total|taxable\s*value|taxable\s*amount)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
const TAX_RATE_REGEX = /(?:tax\s*rate|vat\s*rate|gst\s*rate)[:.\s]*([0-9]+(?:\.[0-9]+)?)\s*%/i
const GST_AMOUNT_REGEX = /(?:gst\s*amount|total\s*tax|vat\s*amount|tax(?!\s*rate))[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
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

  const isInvalidDoc = safeData.isValidInvoice === false || safeData.isInvoiceDocument === false

  if (isInvalidDoc) {
    missingMandatoryFields.push('Document Validation (Uploaded File is NOT a Valid Invoice)')
  }

  // Mandatory checks
  const vName = String(safeData.vendorName || '').trim()
  if (!vName || vName === 'Unknown Vendor' || vName === 'Extracted Vendor' || vName.includes('Unrecognized Vendor')) {
    missingMandatoryFields.push('Vendor Name')
  }
  
  const invNum = String(safeData.invoiceNumber || '').trim()
  if (!invNum || invNum === 'INV-001' || invNum === 'N/A' || invNum === 'INV-INVALID') {
    missingMandatoryFields.push('Invoice Number')
  }

  const invDate = String(safeData.invoiceDate || '').trim()
  if (!invDate || invDate === '-') {
    missingMandatoryFields.push('Invoice Date')
  }

  const totAmt = Number(safeData.totalAmount || safeData.amount || 0)
  if (totAmt <= 0) {
    missingMandatoryFields.push('Grand Total / Total Payable Amount (₹0)')
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
  // Invoice Number
  const invMatch = text.match(INV_NUMBER_REGEX)
  const invoiceNumber = invMatch ? invMatch[1].trim() : null

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

  // Currency Detection: Default to INR for Indian invoices
  let currency = 'INR'
  const upperText = text.toUpperCase()
  if (
    text.includes('₹') ||
    upperText.includes('INR') ||
    upperText.includes('RS.') ||
    upperText.includes('RS ') ||
    upperText.includes('RUPEE') ||
    GSTIN_REGEX.test(text)
  ) {
    currency = 'INR'
  } else if (text.includes('$') || upperText.includes('USD')) {
    currency = 'USD'
  } else if (text.includes('€') || upperText.includes('EUR')) {
    currency = 'EUR'
  } else if (text.includes('£') || upperText.includes('GBP')) {
    currency = 'GBP'
  }

  // Balance Due / Grand Total matching
  let totalAmount = 0
  const balanceDueMatch = text.match(/(?:balance\s*due|grand\s*total|total\s*payable|amount\s*payable)[:.\s]*[₹$€£\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i)
  if (balanceDueMatch) {
    totalAmount = parseNumber(balanceDueMatch[1])
  } else {
    const totalMatch = text.match(TOTAL_AMOUNT_REGEX)
    totalAmount = totalMatch ? parseNumber(totalMatch[1]) : 0
  }

  let subtotalMatch = text.match(SUBTOTAL_REGEX)
  let subtotal = subtotalMatch ? parseNumber(subtotalMatch[1]) : 0

  const taxRateMatch = text.match(TAX_RATE_REGEX)
  const taxRate = taxRateMatch ? parseFloat(taxRateMatch[1]) : 0

  const gstMatch = text.match(GST_AMOUNT_REGEX)
  let gst = gstMatch ? parseNumber(gstMatch[1]) : 0

  // Precise mathematical tax & subtotal reconciliation
  if (totalAmount > subtotal && subtotal > 0) {
    gst = Math.round((totalAmount - subtotal) * 100) / 100
  } else if (gst === 0 && taxRate > 0 && subtotal > 0) {
    gst = Math.round((subtotal * (taxRate / 100)) * 100) / 100
    if (totalAmount === 0) totalAmount = subtotal + gst
  } else if (subtotal === 0 && totalAmount > 0 && gst > 0) {
    subtotal = Math.round((totalAmount - gst) * 100) / 100
  }

  const cgstMatch = text.match(CGST_REGEX)
  const cgst = cgstMatch ? parseNumber(cgstMatch[1]) : 0

  const sgstMatch = text.match(SGST_REGEX)
  const sgst = sgstMatch ? parseNumber(sgstMatch[1]) : 0

  const igstMatch = text.match(IGST_REGEX)
  const igst = igstMatch ? parseNumber(igstMatch[1]) : 0

  const shippingMatch = text.match(SHIPPING_REGEX)
  const shippingCharges = shippingMatch ? parseNumber(shippingMatch[1]) : 0

  // Vendor Email & Address Detection
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i)
  const vendorEmail = emailMatch ? emailMatch[0] : ''

  let vendorAddress = ''
  for (const line of safeLines.slice(0, 15)) {
    if (
      /(?:plot|road|estate|street|nagar|marg|building|suite|floor|camp|victoria|layout|apartment|colony|industrial|gidc|hub|lane|phase|sector|\d{6})/i.test(line) &&
      !line.toLowerCase().includes('tax invoice') &&
      !line.toLowerCase().includes('gstin') &&
      !line.toLowerCase().includes('invoice no')
    ) {
      vendorAddress = line.trim()
      break
    }
  }

  return {
    vendorName,
    vendorGstin,
    vendorAddress,
    vendorEmail,
    buyerName,
    buyerGstin,
    buyerAddress: '',
    buyerEmail: '',
    invoiceNumber,
    invoiceDate,
    dueDate,
    paymentTerms,
    notes,
    currency,
    totalAmount,
    subtotal,
    gst,
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
      // Remove leading row index token (e.g., "# 1", "1", "2", "3")
      let cleanedTokens = [...tokens]
      if (/^[0-9]+[.]?$/.test(cleanedTokens[0])) {
        cleanedTokens.shift()
      }

      if (cleanedTokens.length >= 2) {
        const numbers = []
        const textParts = []

        for (const token of cleanedTokens) {
          const num = parseNumber(token)
          if (num > 0 || token === '0' || token === '0.00' || token === '1.00') {
            if (/\d/.test(token)) {
              numbers.push(num)
            } else {
              textParts.push(token)
            }
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
            unitPrice = numbers[1]
            amount = numbers[numbers.length - 1]
          }

          if (description.length > 2 && amount > 0) {
            const calculatedTotal = quantity * unitPrice
            let taxAmount = 0
            if (amount > calculatedTotal && calculatedTotal > 0) {
              taxAmount = Math.round((amount - calculatedTotal) * 100) / 100
            }
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
  }

  return lineItems
}

/**
 * Strict Rule Engine & Routing Evaluator
 * Evaluates whether OCR output meets strict criteria for OCR_ONLY processing:
 * 1. OCR Confidence >= 90%
 * 2. All 4 mandatory header fields present (vendorName, invoiceNumber, invoiceDate, totalAmount > 0)
 * 3. Zero critical parsing errors (e.g. corrupted line items)
 *
 * IF OCR Confidence is below 90% or mandatory fields are missing, it MUST route to GEMINI AI fallback.
 */
export function evaluateOCRQuality(rawText, ocrConfidence, lines = []) {
  const headerData = parseHeaderFields(rawText, lines)
  const lineItems = parseTableLineItems(lines)

  const { missingMandatoryFields, missingOptionalFields } = computeMissingFields({
    ...headerData,
    lineItems,
  })

  const validationErrors = []
  const rawScore = Number(ocrConfidence) || 0

  // Rule 1: OCR Confidence MUST be >= 90%
  if (rawScore < 90) {
    validationErrors.push(`OCR confidence score (${rawScore.toFixed(1)}%) is below the required 90% threshold. Initiating Gemini AI fallback.`)
  }

  // Rule 2: Mandatory Header Fields check
  if (missingMandatoryFields.length > 0) {
    validationErrors.push(`Missing mandatory fields for local OCR: ${missingMandatoryFields.join(', ')}`)
  }

  // Rule 3: Line items sanity check
  let lineItemsCorrupted = false
  for (const item of lineItems) {
    if (item.amount > 50 && (item.unitPrice <= 1 || item.tax > item.amount * 0.5)) {
      lineItemsCorrupted = true
      validationErrors.push(`Corrupted line item detected: ${item.description}`)
      break
    }
  }

  // STRICT REQUIREMENT: OCR_ONLY strategy ONLY if confidence >= 90% AND zero missing mandatory fields AND line items uncorrupted
  const isHighConfidence = rawScore >= 90 && missingMandatoryFields.length === 0 && !lineItemsCorrupted

  const strategy = isHighConfidence ? 'OCR_ONLY' : 'OCR_FALLBACK_GEMINI'
  const extractionSource = isHighConfidence ? 'OCR' : 'GEMINI'

  return {
    isHighConfidence,
    strategy,
    extractionSource,
    validationErrors,
    missingMandatoryFields,
    missingOptionalFields,
    ocrConfidence: rawScore,
    parsedData: {
      ...headerData,
      lineItems,
    },
  }
}
