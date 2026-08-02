/**
 * Backend Validation rules for extracted invoice data
 */
export const validateExtractedInvoice = (data) => {
  const errors = []

  // 1. Missing Vendor Name
  if (!data.vendorName || data.vendorName.trim() === '' || data.vendorName === 'null') {
    errors.push('Missing required field: Vendor Name')
  }

  // 2. Missing Invoice Number
  if (!data.invoiceNumber || data.invoiceNumber.trim() === '' || data.invoiceNumber === 'null') {
    errors.push('Missing required field: Invoice Number')
  }

  // 3. Negative or Invalid Amount
  if (data.totalAmount === undefined || data.totalAmount === null || isNaN(data.totalAmount)) {
    errors.push('Missing required field: Total Amount')
  } else if (Number(data.totalAmount) < 0) {
    errors.push('Invalid financial data: Negative total amount detected')
  }

  // 4. Invalid Dates
  if (data.invoiceDate && isNaN(Date.parse(data.invoiceDate))) {
    errors.push('Invalid invoice date format')
  }
  if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
    errors.push('Invalid due date format')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Middleware validator for updating invoice records
 */
export const updateInvoiceValidator = (req, res, next) => {
  const { amount, vendorName, invoiceNumber } = req.body

  if (amount !== undefined && (isNaN(amount) || Number(amount) < 0)) {
    return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' })
  }

  if (vendorName !== undefined && typeof vendorName === 'string' && vendorName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Vendor name cannot be empty' })
  }

  if (invoiceNumber !== undefined && typeof invoiceNumber === 'string' && invoiceNumber.trim() === '') {
    return res.status(400).json({ success: false, message: 'Invoice number cannot be empty' })
  }

  next()
}

/**
 * Middleware validator for invoice approval actions
 */
export const approvalValidator = (req, res, next) => {
  const { action, comments } = req.body

  if (action && !['approve', 'reject', 'request_changes'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid approval action specified' })
  }

  next()
}
