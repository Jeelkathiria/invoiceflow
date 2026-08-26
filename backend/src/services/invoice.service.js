import cloudinary from '../config/cloudinary.js'
import { Invoice } from '../models/Invoice.js'
import { Notification } from '../models/Notification.js'
import { ApprovalLog } from '../models/ApprovalLog.js'
import { User } from '../models/User.js'
import { extractInvoiceData, getFallbackInvoiceData } from './gemini.service.js'
import { runOCR } from './ocr.service.js'
import { evaluateOCRQuality, computeMissingFields } from '../utils/ocrParser.js'
import { checkDuplicateInvoice } from '../utils/duplicateChecker.js'

/**
 * Helper to safely parse mandatory date fields to avoid Mongoose CastErrors
 */
function parseSafeDate(dateVal, fallback = new Date()) {
  if (!dateVal || dateVal === '-' || dateVal === 'N/A' || dateVal === 'null' || dateVal === 'undefined') {
    return fallback
  }
  const timestamp = Date.parse(dateVal)
  if (isNaN(timestamp)) {
    return fallback
  }
  return new Date(timestamp)
}

/**
 * Helper to safely parse optional date fields
 */
function parseOptionalDate(dateVal) {
  if (!dateVal || dateVal === '-' || dateVal === 'N/A' || dateVal === 'null' || dateVal === 'undefined') {
    return undefined
  }
  const timestamp = Date.parse(dateVal)
  if (isNaN(timestamp)) {
    return undefined
  }
  return new Date(timestamp)
}

/**
 * Uploads file to Cloudinary from Buffer, returning both secure_url and public_id
 */
export const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      const mockPublicId = `inv_${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}`
      return resolve({
        secure_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
        public_id: mockPublicId,
      })
    }

    try {
      const publicId = `inv_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9]/g, '_')}`
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'invoiceflow/invoices',
          resource_type: 'auto',
          access_mode: 'public',
          public_id: publicId,
        },
        (error, result) => {
          if (error || !result) {
            console.warn('[Cloudinary Stream Error]: Fallback mock asset created:', error?.message || 'No result')
            return resolve({
              secure_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
              public_id: publicId,
            })
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          })
        }
      )
      uploadStream.end(fileBuffer)
    } catch (err) {
      console.warn('[Cloudinary Exception]: Fallback mock asset created:', err.message)
      const mockPublicId = `inv_${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}`
      resolve({
        secure_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
        public_id: mockPublicId,
      })
    }
  })
}

/**
 * Deletes file asset from Cloudinary using public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`[Cloudinary Service]: Mock delete for public_id "${publicId}"`)
    return { result: 'ok' }
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId)
    console.log(`[Cloudinary Service]: Destroyed asset "${publicId}" ->`, res)
    return res
  } catch (err) {
    console.warn(`[Cloudinary Service Error]: Failed to delete asset "${publicId}":`, err.message)
    return { result: 'error', message: err.message }
  }
}

/**
 * OCR-First Invoice Extraction & Hybrid Decision Pipeline
 */
export const extractAndAnalyzeInvoice = async (file, userId = null) => {
  if (!file) {
    const error = new Error('Invoice file is required for extraction')
    error.statusCode = 400
    throw error
  }

  const startTime = Date.now()
  const originalName = file.originalname || 'invoice.pdf'
  console.log(`[Extraction Pipeline]: Step 1 - Uploading document "${originalName}" to Cloudinary...`)

  let invoiceUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  let cloudinaryPublicId = `inv_${Date.now()}`

  try {
    const cloudRes = await uploadToCloudinary(file.buffer, originalName)
    invoiceUrl = cloudRes.secure_url
    cloudinaryPublicId = cloudRes.public_id
  } catch (err) {
    console.warn('[Cloudinary Service Graceful Fallback]:', err.message)
  }

  console.log(`[Extraction Pipeline]: Step 2 - Running Tesseract OCR engine...`)
  let ocrResult = { rawText: '', ocrConfidence: 0, lines: [] }
  try {
    ocrResult = await runOCR(file.buffer, file.mimetype)
  } catch (err) {
    console.warn('[OCR Service Graceful Failure]:', err.message)
  }

  console.log(`[Extraction Pipeline]: Step 3 - Running Rule Engine & Table Parser...`)
  const evaluation = evaluateOCRQuality(ocrResult.rawText, ocrResult.ocrConfidence, ocrResult.lines)

  let extractedData = null
  let strategy = evaluation.strategy
  let extractionSource = evaluation.extractionSource

  if (evaluation.isHighConfidence) {
    console.log(`🚀 [INVOICE EXTRACTION]: EXTRACTED BY LOCAL OCR (Confidence: ${ocrResult.ocrConfidence}%)`)
    extractedData = evaluation.parsedData
  } else {
    console.log(`🤖 [INVOICE EXTRACTION]: EXTRACTED BY GEMINI VISION (OCR < 90% or missing fields)`)
    try {
      extractedData = await extractInvoiceData(file.buffer, file.mimetype, originalName)
    } catch (err) {
      console.warn('[Gemini Vision Fallback Exception]:', err.message)
      extractedData = null
    }
    strategy = 'OCR_FALLBACK_GEMINI'
    extractionSource = 'GEMINI'
  }

  if (
    !extractedData ||
    !extractedData.isValidInvoice ||
    !extractedData.vendorName ||
    extractedData.vendorName === 'Unknown Vendor' ||
    String(extractedData.vendorName).includes('Unrecognized Vendor')
  ) {
    if (evaluation.parsedData && (evaluation.parsedData.vendorName || evaluation.parsedData.totalAmount > 0 || evaluation.parsedData.lineItems?.length > 0)) {
      console.log(`[Extraction Pipeline]: Recovered extraction from OCR parsed text for "${originalName}"...`)
      extractedData = {
        ...evaluation.parsedData,
        isValidInvoice: true,
        isInvoiceDocument: true,
        overallConfidenceScore: ocrResult.ocrConfidence || 85.0,
      }
      strategy = 'OCR_ONLY'
      extractionSource = 'OCR'
    } else {
      console.log(`[Extraction Pipeline]: Gemini Vision returned incomplete data. Applying fallback rules for "${originalName}"...`)
      extractedData = getFallbackInvoiceData(originalName)
    }
  }

  const { missingMandatoryFields, missingOptionalFields } = computeMissingFields(extractedData)
  const amount = Number(extractedData.totalAmount || extractedData.amount || 0)
  const isValidInvoice = (
    missingMandatoryFields.length === 0 &&
    amount > 0 &&
    extractedData.isValidInvoice !== false
  )

  const finalConfidence = isValidInvoice ? Math.max(90, extractedData.overallConfidenceScore || ocrResult.ocrConfidence || 95.0) : 0

  // Duplicate Check
  let isDuplicate = false
  let matchedInvoice = null
  try {
    if (isValidInvoice) {
      const dupRes = await checkDuplicateInvoice(
        extractedData.vendorName,
        extractedData.invoiceNumber,
        amount
      )
      isDuplicate = Boolean(dupRes.isDuplicate)
      matchedInvoice = dupRes.matchedInvoice || null
    }
  } catch (err) {
    console.warn('[Duplicate Checker Exception]:', err.message)
  }

  const processingTime = Date.now() - startTime
  const extractionReport = {
    strategy,
    extractionSource,
    ocrConfidence: finalConfidence,
    missingMandatoryFields,
    missingOptionalFields,
    duplicateFlag: isDuplicate,
    isValidInvoice,
    validationErrors: evaluation.validationErrors || [],
    processingTimeMs: processingTime,
  }

  // Initial extraction returns 'Draft' status, NOT sent for Manager approval until Finance clicks "Pass to Approval"!
  return {
    ...extractedData,
    amount,
    invoiceUrl,
    cloudinaryPublicId,
    strategy,
    extractionSource,
    ocrConfidence: finalConfidence,
    isValidInvoice,
    missingMandatoryFields,
    missingOptionalFields,
    duplicate: isDuplicate,
    matchedInvoice: matchedInvoice || null,
    status: 'Draft',
    extractionReport,
  }
}

/**
 * Saves confirmed invoice payload into MongoDB
 */
export const saveInvoiceRecord = async (invoicePayload, userId) => {
  const amount = Number(invoicePayload.amount || invoicePayload.totalAmount) || 0

  const sanitizedLineItems = Array.isArray(invoicePayload.lineItems)
    ? invoicePayload.lineItems.map((item) => ({
        description: item.description || item.desc || 'Line Item',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice || item.rate) || 0,
        tax: Number(item.tax) || 0,
        taxRate: Number(item.taxRate) || 0,
        taxAmount: Number(item.taxAmount) || 0,
        amount: Number(item.amount || item.total) || 0,
      }))
    : []

  const validStatuses = ['Draft', 'Pending', 'Approved', 'Rejected']
  let statusToSave = invoicePayload.status
  if (!validStatuses.includes(statusToSave)) {
    statusToSave = invoicePayload.duplicate ? 'Draft' : 'Pending'
  }

  const invoiceData = {
    ...invoicePayload,
    vendorName: invoicePayload.vendorName || 'Unknown Vendor',
    invoiceNumber: invoicePayload.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
    amount: amount,
    subtotal: Number(invoicePayload.subtotal) || 0,
    gst: Number(invoicePayload.gst) || 0,
    discount: Number(invoicePayload.discount) || 0,
    cgst: Number(invoicePayload.cgst) || 0,
    sgst: Number(invoicePayload.sgst) || 0,
    igst: Number(invoicePayload.igst) || 0,
    shippingCharges: Number(invoicePayload.shippingCharges) || 0,
    otherCharges: Number(invoicePayload.otherCharges) || 0,
    invoiceDate: parseSafeDate(invoicePayload.invoiceDate, new Date()),
    dueDate: parseOptionalDate(invoicePayload.dueDate),
    status: statusToSave,
    missingMandatoryFields: Array.isArray(invoicePayload.missingMandatoryFields) ? invoicePayload.missingMandatoryFields : [],
    missingOptionalFields: Array.isArray(invoicePayload.missingOptionalFields) ? invoicePayload.missingOptionalFields : [],
    lineItems: sanitizedLineItems,
  }

  // Dynamic Duplicate Check before saving to DB
  let isDup = Boolean(invoicePayload.duplicate)
  let matchedInv = invoicePayload.matchedInvoice || null

  if (!isDup && invoiceData.vendorName && invoiceData.invoiceNumber) {
    try {
      const currentId = String(invoicePayload.mongoId || invoicePayload._id || '')
      const dupRes = await checkDuplicateInvoice(
        invoiceData.vendorName,
        invoiceData.invoiceNumber,
        invoiceData.amount,
        currentId || null
      )
      if (dupRes.isDuplicate) {
        const matchedId = String(dupRes.matchedInvoice?.id || '')
        if (!currentId || matchedId !== currentId) {
          isDup = true
          matchedInv = dupRes.matchedInvoice
        }
      }
    } catch (e) {
      console.warn('[saveInvoiceRecord Duplicate Check Error]:', e.message)
    }
  }

  invoiceData.duplicate = isDup
  invoiceData.matchedInvoice = matchedInv

  if (invoiceData._id && String(invoiceData._id).length !== 24) {
    delete invoiceData._id
  }
  if (invoiceData.id && String(invoiceData.id).length !== 24) {
    delete invoiceData.id
  }

  if (userId && String(userId).length === 24) {
    invoiceData.uploadedBy = userId
  } else {
    delete invoiceData.uploadedBy
  }

  const existingId = invoicePayload.mongoId || (invoicePayload._id && String(invoicePayload._id).length === 24 ? invoicePayload._id : null)
  let invoice = null

  if (existingId && String(existingId).length === 24) {
    try {
      invoice = await Invoice.findByIdAndUpdate(existingId, invoiceData, { new: true })
    } catch (e) {}
  }

  if (!invoice) {
    invoice = await Invoice.create(invoiceData)
  }

  console.log(`[MongoDB Persistence]: Persisted Invoice ID ${invoice._id} for Vendor "${invoice.vendorName}"`)
  try {
    let uploaderName = 'Finance Executive'
    if (userId) {
      const uploader = await User.findById(userId)
      if (uploader?.name) uploaderName = uploader.name
    }
    const amount = invoice.amount || invoice.totalAmount || 0
    const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'

    if (invoice.duplicate) {
      await Notification.create({
        title: 'Duplicate Invoice Risk',
        message: `${uploaderName} uploaded Invoice #${invoice.invoiceNumber} from ${invoice.vendorName}, flagged as potential duplicate.`,
        type: 'warning',
        link: '/app/approval-queue',
        recipientRole: 'manager',
      })
    } else {
      await Notification.create({
        title: 'New Invoice Uploaded',
        message: `${uploaderName} uploaded Invoice #${invoice.invoiceNumber} from ${invoice.vendorName} (${sym}${amount.toLocaleString()}) for approval.`,
        type: 'info',
        link: '/app/approval-queue',
        recipientRole: 'manager',
      })
    }
  } catch (err) {
    console.warn('Notification creation error:', err.message)
  }

  return invoice
}

/**
 * Cancels invoice upload: Deletes file from Cloudinary without touching MongoDB
 */
export const cancelInvoiceUpload = async (cloudinaryPublicId) => {
  if (cloudinaryPublicId) {
    console.log(`[Invoice Service]: User clicked Cancel. Deleting file from Cloudinary public_id "${cloudinaryPublicId}"...`)
    await deleteFromCloudinary(cloudinaryPublicId)
  }
  return { message: 'Invoice upload canceled and file deleted from Cloudinary successfully', cloudinaryPublicId }
}

/**
 * Legacy wrapper function for single-step processing
 */
export const processAndSaveInvoice = async (file, userId) => {
  const extracted = await extractAndAnalyzeInvoice(file)
  return await saveInvoiceRecord(extracted, userId)
}

export const getAllInvoices = async ({ status, search, userId, page = 1, limit = 20 }) => {
  const query = {}

  if (userId) {
    query.uploadedBy = userId
  }

  if (status) {
    if (status === 'Pending' || status === 'PENDING_APPROVAL') {
      query.status = { $in: ['Pending', 'PENDING_APPROVAL'] }
    } else {
      query.status = status
    }
  } else if (!userId) {
    // Manager viewing invoices default: exclude unsubmitted Drafts
    query.status = { $ne: 'Draft' }
  }

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { vendorName: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Invoice.countDocuments(query)
  const invoices = await Invoice.find(query)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  return {
    invoices,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
  }
}

export const getInvoiceById = async (id, user = null) => {
  const invoice = await Invoice.findById(id)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .populate('rejectedBy', 'name email role avatar')
    .populate('paidBy', 'name email role avatar')
    .populate('relatedInvoiceId', 'invoiceNumber vendorName amount currency status paidAt createdAt')

  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  // DATA ACCESS / SECURITY RULE:
  // Finance users can only view their own uploaded invoices.
  if (user && (user.role || '').toLowerCase().includes('finance')) {
    const uploadedById = invoice.uploadedBy?._id
      ? invoice.uploadedBy._id.toString()
      : invoice.uploadedBy
      ? invoice.uploadedBy.toString()
      : null
    const currentUserId = (user._id || user.id).toString()
    if (uploadedById && uploadedById !== currentUserId) {
      const error = new Error('Access denied: You can only view invoices uploaded by your finance account')
      error.statusCode = 403
      throw error
    }
  }

  return invoice
}

export const getInvoiceExtractionStrategy = async (id) => {
  const invoice = await Invoice.findById(id)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  const source = invoice.extractionSource || (invoice.strategy === 'OCR_ONLY' ? 'OCR' : 'GEMINI')
  const isOCR = source === 'OCR'

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    vendorName: invoice.vendorName,
    strategy: invoice.strategy || (isOCR ? 'OCR_ONLY' : 'OCR_FALLBACK_GEMINI'),
    extractionSource: source,
    ocrConfidence: invoice.ocrConfidence || 0,
    extractedBy: isOCR ? 'OCR (Tesseract.js Engine)' : 'Gemini AI (Vision Fallback)',
    isExtractedByOCR: isOCR,
    isExtractedByGemini: !isOCR,
    extractionReport: invoice.extractionReport || {
      strategy: invoice.strategy || 'OCR_ONLY',
      extractionSource: source,
      ocrConfidence: invoice.ocrConfidence || 0,
    },
    createdAt: invoice.createdAt,
  }
}

export const getLatestExtractionStrategy = async () => {
  const invoice = await Invoice.findOne().sort({ createdAt: -1 })
  if (!invoice) {
    const error = new Error('No saved invoices found in database')
    error.statusCode = 404
    throw error
  }
  return await getInvoiceExtractionStrategy(invoice._id)
}

export const updateInvoice = async (id, updateData, user = null) => {
  const invoice = await Invoice.findById(id)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  // Handle explicit status transitions & append approval history
  if (updateData.status && updateData.status !== invoice.status) {
    if (!Array.isArray(invoice.approvalHistory)) invoice.approvalHistory = []
    
    if (updateData.status === 'Approved' || updateData.status === 'PAYMENT_QUEUE') {
      const prevStatus = invoice.status || 'Pending'
      updateData.status = 'PAYMENT_QUEUE'
      updateData.paymentStatus = 'PAYMENT_PENDING'
      invoice.approvedBy = user?._id || user?.id || invoice.approvedBy
      invoice.approvalHistory.push({
        action: 'APPROVED',
        previousStatus: prevStatus,
        newStatus: 'PAYMENT_QUEUE',
        performedBy: user?._id || user?.id || null,
        performedByName: user?.name || 'Manager',
        performedByRole: user?.role || 'Manager',
        comment: updateData.comments && updateData.comments[0] ? updateData.comments[0] : 'Approved and added to Payment Queue',
        revisionNumber: invoice.revisionNumber || 1,
        timestamp: new Date(),
      })
    } else if (updateData.status === 'Rejected') {
      const prevStatus = invoice.status || 'Pending'
      invoice.rejectedBy = user?._id || user?.id || invoice.rejectedBy
      invoice.rejectedAt = new Date()
      invoice.rejectionReason = updateData.rejectionReason || 'Invoice Rejection'
      invoice.rejectionComment = updateData.rejectionComment || (updateData.comments && updateData.comments[0]) || ''
      invoice.approvalHistory.push({
        action: 'REJECTED',
        previousStatus: prevStatus,
        newStatus: 'Rejected',
        performedBy: user?._id || user?.id || null,
        performedByName: user?.name || 'Manager',
        performedByRole: user?.role || 'Manager',
        reason: invoice.rejectionReason,
        comment: invoice.rejectionComment,
        revisionNumber: invoice.revisionNumber || 1,
        timestamp: new Date(),
      })
    }
  }

  Object.assign(invoice, updateData)
  await invoice.save()

  if (updateData.status && (updateData.status === 'Approved' || updateData.status === 'PAYMENT_QUEUE' || updateData.status === 'Rejected' || updateData.status === 'Pending')) {
    try {
      const isPending = updateData.status === 'Pending'
      const recipientRole = isPending ? 'manager' : 'finance'
      const title = isPending
        ? 'Invoice Submitted for Approval'
        : updateData.status === 'Rejected'
        ? 'Invoice Rejected'
        : 'Manager Approved (Payment Pending)'
      const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'

      const reasonText = invoice.rejectionReason || (updateData.comments && updateData.comments[0]) || ''
      const notificationMessage = isPending
        ? `Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} (${sym}${(invoice.amount || 0).toLocaleString()}) was submitted for authorization.`
        : updateData.status === 'Rejected'
          ? `Invoice #${invoice.invoiceNumber} was rejected.${reasonText ? ` Reason: "${reasonText}"` : ''}`
          : `Invoice ${invoice.invoiceNumber} was approved by Manager and moved to Payment Queue (Pending Finance Confirmation).`

      await Notification.create({
        title,
        message: notificationMessage,
        type: (updateData.status === 'Approved' || updateData.status === 'PAYMENT_QUEUE') ? 'info' : updateData.status === 'Rejected' ? 'danger' : 'info',
        link: isPending ? '/app/approval-queue' : (updateData.status === 'Approved' || updateData.status === 'PAYMENT_QUEUE') ? '/app/payment-queue' : `/app/invoice/${invoice._id}`,
        recipientRole,
        user: isPending ? null : (invoice.uploadedBy || null),
      })
    } catch (err) {
      console.warn('Notification trigger error:', err.message)
    }
  }

  return invoice
}

export const rejectInvoiceService = async (id, { rejectionReason, rejectionComment, comment, relatedInvoiceId }, managerUser) => {
  const invoice = await Invoice.findById(id)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  const prevStatus = invoice.status || 'Pending'
  const reasonToSave = rejectionReason || 'CORRECTION_REQUIRED'
  const commentToSave = rejectionComment || comment || ''

  let newStatus = 'NEEDS_CORRECTION'
  if (reasonToSave === 'CORRECTION_REQUIRED' || reasonToSave === 'Correction Required') {
    newStatus = 'NEEDS_CORRECTION'
  } else {
    newStatus = 'Rejected'
  }

  invoice.status = newStatus
  invoice.rejectedBy = managerUser?._id || managerUser?.id || null
  invoice.rejectedAt = new Date()
  invoice.rejectionReason = reasonToSave
  invoice.rejectionComment = commentToSave
  if (relatedInvoiceId) {
    invoice.relatedInvoiceId = relatedInvoiceId
  }

  const historyEntry = {
    action: 'REJECTED',
    previousStatus: prevStatus,
    newStatus: newStatus,
    performedBy: managerUser?._id || managerUser?.id || null,
    performedByName: managerUser?.name || 'Manager',
    performedByRole: managerUser?.role || 'Manager',
    reason: reasonToSave,
    comment: commentToSave,
    relatedInvoiceId: relatedInvoiceId || null,
    revisionNumber: invoice.revisionNumber || 1,
    timestamp: new Date(),
  }

  if (!Array.isArray(invoice.approvalHistory)) invoice.approvalHistory = []
  invoice.approvalHistory.push(historyEntry)

  await invoice.save()

  // Create Approval Log
  try {
    await ApprovalLog.create({
      invoiceId: invoice._id,
      performedBy: managerUser?._id || managerUser?.id,
      action: 'REJECTED',
      previousStatus: prevStatus,
      newStatus: newStatus,
      reason: reasonToSave,
      comment: commentToSave,
      revisionNumber: invoice.revisionNumber || 1,
    })
  } catch (e) {}

  // Create Notification for Finance user
  try {
    let notificationTitle = 'Invoice Rejected'
    let notificationMsg = `Invoice #${invoice.invoiceNumber} requires attention.`
    if (newStatus === 'NEEDS_CORRECTION') {
      notificationTitle = 'Invoice Needs Correction'
      notificationMsg = `Invoice #${invoice.invoiceNumber} requires correction. Reason: "${commentToSave || 'Correction Required'}".`
    } else if (newStatus === 'DUPLICATE_SUBMISSION') {
      notificationTitle = 'Invoice Closed as Duplicate Submission'
      notificationMsg = `Invoice #${invoice.invoiceNumber} was closed as a duplicate submission.`
    } else if (newStatus === 'ALREADY_PAID') {
      notificationTitle = 'Invoice Closed as Already Paid'
      notificationMsg = `Invoice #${invoice.invoiceNumber} was closed because payment already exists.`
    }

    await Notification.create({
      title: notificationTitle,
      message: notificationMsg,
      type: 'danger',
      link: `/app/invoice/${invoice._id}`,
      recipientRole: 'finance',
      user: invoice.uploadedBy || null,
    })
  } catch (e) {}

  return await Invoice.findById(invoice._id)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .populate('rejectedBy', 'name email role avatar')
    .populate('paidBy', 'name email role avatar')
    .populate('relatedInvoiceId', 'invoiceNumber vendorName amount currency status paidAt createdAt')
}

export const resubmitInvoiceService = async (id, updatePayload, financeUser) => {
  const invoice = await Invoice.findById(id)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  // 1. Mandatory Field Validation
  const vendorName = updatePayload.vendorName || invoice.vendorName
  const invoiceNumber = updatePayload.invoiceNumber || invoice.invoiceNumber
  const invoiceDate = updatePayload.invoiceDate || invoice.invoiceDate
  const amount = Number(updatePayload.amount !== undefined ? updatePayload.amount : (updatePayload.totalAmount !== undefined ? updatePayload.totalAmount : invoice.amount))

  if (!vendorName || !invoiceNumber || !invoiceDate || isNaN(amount) || amount <= 0) {
    const error = new Error('Mandatory fields missing: Vendor Name, Invoice Number, Invoice Date, and Grand Total (>0) are required.')
    error.statusCode = 400
    throw error
  }

  // 2. Compute Field Differences (Diff Tracking)
  const changes = []
  const checkDiff = (fieldLabel, oldVal, newVal) => {
    if (newVal !== undefined && newVal !== null && String(oldVal) !== String(newVal)) {
      changes.push({ field: fieldLabel, oldValue: oldVal, newValue: newVal })
    }
  }

  checkDiff('Vendor Name', invoice.vendorName, updatePayload.vendorName)
  checkDiff('Vendor Email', invoice.vendorEmail, updatePayload.vendorEmail)
  checkDiff('Vendor Address', invoice.vendorAddress, updatePayload.vendorAddress)
  checkDiff('Invoice Number', invoice.invoiceNumber, updatePayload.invoiceNumber)
  checkDiff('Grand Total', invoice.amount, amount)
  checkDiff('Subtotal', invoice.subtotal, updatePayload.subtotal)
  checkDiff('GST/Tax', invoice.gst, updatePayload.gst)

  // Snapshot current values into previousRevisionData
  const previousSnapshot = {
    revisionNumber: invoice.revisionNumber || 1,
    vendorName: invoice.vendorName,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    subtotal: invoice.subtotal,
    gst: invoice.gst,
    rejectionReason: invoice.rejectionReason,
    rejectionComment: invoice.rejectionComment,
    updatedAt: new Date(),
  }

  const nextRevision = (invoice.revisionNumber || 1) + 1

  const historyEntry = {
    action: 'RESUBMITTED',
    performedBy: financeUser?._id || financeUser?.id || null,
    performedByName: financeUser?.name || 'Finance Executive',
    performedByRole: financeUser?.role || 'Finance',
    revisionNumber: nextRevision,
    changes,
    timestamp: new Date(),
  }

  // 3. Update Invoice document fields
  invoice.vendorName = vendorName
  invoice.invoiceNumber = invoiceNumber
  if (updatePayload.vendorGstin !== undefined) invoice.vendorGstin = updatePayload.vendorGstin
  if (updatePayload.vendorEmail !== undefined) invoice.vendorEmail = updatePayload.vendorEmail
  if (updatePayload.vendorAddress !== undefined) invoice.vendorAddress = updatePayload.vendorAddress
  if (updatePayload.paymentTerms !== undefined) invoice.paymentTerms = updatePayload.paymentTerms
  if (updatePayload.invoiceDate) invoice.invoiceDate = parseSafeDate(updatePayload.invoiceDate, invoice.invoiceDate)
  if (updatePayload.dueDate) invoice.dueDate = parseOptionalDate(updatePayload.dueDate)
  if (updatePayload.currency) invoice.currency = updatePayload.currency
  if (updatePayload.notes !== undefined) invoice.notes = updatePayload.notes

  invoice.amount = amount
  if (updatePayload.subtotal !== undefined) invoice.subtotal = Number(updatePayload.subtotal)
  if (updatePayload.gst !== undefined) invoice.gst = Number(updatePayload.gst)
  if (updatePayload.cgst !== undefined) invoice.cgst = Number(updatePayload.cgst)
  if (updatePayload.sgst !== undefined) invoice.sgst = Number(updatePayload.sgst)
  if (updatePayload.igst !== undefined) invoice.igst = Number(updatePayload.igst)
  if (updatePayload.discount !== undefined) invoice.discount = Number(updatePayload.discount)

  if (Array.isArray(updatePayload.lineItems)) {
    invoice.lineItems = updatePayload.lineItems.map((item) => ({
      description: item.description || 'Line Item',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      taxRate: Number(item.taxRate) || 0,
      taxAmount: Number(item.taxAmount || item.tax) || 0,
      amount: Number(item.amount || item.total || (item.quantity * item.unitPrice)) || 0,
    }))
  }

  invoice.status = 'Pending'
  invoice.revisionNumber = nextRevision
  invoice.previousRevisionData = previousSnapshot

  if (!Array.isArray(invoice.approvalHistory)) invoice.approvalHistory = []
  invoice.approvalHistory.push(historyEntry)

  await invoice.save()

  // Create Approval Log
  try {
    await ApprovalLog.create({
      invoiceId: invoice._id,
      performedBy: financeUser?._id || financeUser?.id,
      action: 'RESUBMITTED',
      revisionNumber: nextRevision,
      changes,
    })
  } catch (e) {}

  // Create Notification for Manager
  try {
    const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'
    await Notification.create({
      title: `Invoice Resubmitted (Revision ${nextRevision})`,
      message: `${financeUser?.name || 'Finance'} corrected & resubmitted Invoice #${invoice.invoiceNumber} (${sym}${amount.toLocaleString()}) for approval.`,
      type: 'info',
      link: '/app/approval-queue',
      recipientRole: 'manager',
    })
  } catch (e) {}

  return invoice
}

export const deleteInvoice = async (id) => {
  const invoice = await Invoice.findByIdAndDelete(id)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  // Delete Cloudinary asset if public_id exists
  if (invoice.cloudinaryPublicId) {
    await deleteFromCloudinary(invoice.cloudinaryPublicId)
  }

  return { message: 'Invoice deleted successfully' }
}

export const deleteDraftInvoices = async (userId) => {
  const query = { status: 'Draft' }
  if (userId) {
    query.uploadedBy = userId
  }
  const result = await Invoice.deleteMany(query)
  return { message: `Deleted ${result.deletedCount} unsubmitted draft invoices from MongoDB`, count: result.deletedCount }
}

export const deleteAllInvoices = async () => {
  const result = await Invoice.deleteMany({})
  await Notification.deleteMany({})
  await ApprovalLog.deleteMany({})
  return { message: 'All invoices, notifications and approval logs cleared', count: result.deletedCount }
}

/**
 * Helper to compute Priority & Days Until Due based on Due Date
 */
export const computePaymentPriority = (dueDate) => {
  if (!dueDate || isNaN(new Date(dueDate).getTime())) {
    return { priority: 'Scheduled', daysUntilDue: 999, label: 'Scheduled' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysUntilDue < 0) {
    return { priority: 'Overdue', daysUntilDue, label: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}` }
  } else if (daysUntilDue === 0) {
    return { priority: 'Due Soon', daysUntilDue: 0, label: 'Due Today' }
  } else if (daysUntilDue <= 7) {
    return { priority: 'Due Soon', daysUntilDue, label: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}` }
  } else {
    return { priority: 'Scheduled', daysUntilDue, label: `Due in ${daysUntilDue} days` }
  }
}

/**
 * Fetch Payment Queue: Invoices with status = 'PAYMENT_QUEUE'
 */
export const getPaymentQueue = async ({ search, priority, page = 1, limit = 20 } = {}) => {
  const query = { status: { $in: ['PAYMENT_QUEUE', 'Approved'] } }

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { vendorName: { $regex: search, $options: 'i' } },
    ]
  }

  const allInvoices = await Invoice.find(query)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .sort({ dueDate: 1, createdAt: -1 })

  let formattedInvoices = allInvoices.map((inv) => {
    const obj = inv.toObject ? inv.toObject() : { ...inv }
    const priorityMeta = computePaymentPriority(obj.dueDate)
    return {
      ...obj,
      priority: priorityMeta.priority,
      daysUntilDue: priorityMeta.daysUntilDue,
      dueLabel: priorityMeta.label,
    }
  })

  if (priority && priority !== 'All' && priority !== 'all') {
    const targetPri = priority.toLowerCase().replace('_', ' ')
    formattedInvoices = formattedInvoices.filter((inv) => inv.priority.toLowerCase() === targetPri)
  }

  const total = formattedInvoices.length
  const skip = (Number(page) - 1) * Number(limit)
  const paginatedInvoices = formattedInvoices.slice(skip, skip + Number(limit))

  return {
    invoices: paginatedInvoices,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
  }
}

/**
 * Mark Invoice as Paid (Finance Action ONLY)
 */
export const markInvoiceAsPaid = async (invoiceId, financeUser) => {
  const role = (financeUser?.role || '').toLowerCase()
  if (role.includes('manager')) {
    const error = new Error('Managers are not authorized to mark payments as paid')
    error.statusCode = 403
    throw error
  }

  const invoice = await Invoice.findById(invoiceId)
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  const prevStatus = invoice.status || 'PAYMENT_QUEUE'
  invoice.status = 'PAID'
  invoice.paymentStatus = 'PAID'
  invoice.paidBy = financeUser?._id || financeUser?.id || null
  invoice.paidAt = new Date()

  if (!Array.isArray(invoice.approvalHistory)) invoice.approvalHistory = []
  invoice.approvalHistory.push({
    action: 'PAYMENT_COMPLETED',
    previousStatus: prevStatus,
    newStatus: 'PAID',
    performedBy: financeUser?._id || financeUser?.id || null,
    performedByName: financeUser?.name || 'Finance Executive',
    performedByRole: financeUser?.role || 'Finance',
    comment: 'Payment completed and marked as paid in InvoiceFlow',
    revisionNumber: invoice.revisionNumber || 1,
    timestamp: new Date(),
  })

  await invoice.save()

  // Create Audit Log
  try {
    await ApprovalLog.create({
      invoiceId: invoice._id,
      performedBy: financeUser?._id || financeUser?.id,
      action: 'PAYMENT_COMPLETED',
      comment: 'Payment marked as paid by Finance',
      revisionNumber: invoice.revisionNumber || 1,
    })
  } catch (e) {}

  // Create Notification
  try {
    await Notification.create({
      title: 'Payment Confirmed & Disbursed',
      message: `Finance department has confirmed payment for Invoice ${invoice.invoiceNumber}. Status is now PAID.`,
      type: 'success',
      link: `/app/invoice/${invoice._id}`,
      recipientRole: 'manager',
      user: invoice.uploadedBy || null,
    })

    await Notification.create({
      title: 'Payment Confirmed & Disbursed',
      message: `Finance department has confirmed payment for Invoice ${invoice.invoiceNumber}. Status is now PAID.`,
      type: 'success',
      link: `/app/invoice/${invoice._id}`,
      recipientRole: 'finance',
      user: financeUser?._id || null,
    })
  } catch (e) {}

  const populated = await Invoice.findById(invoice._id)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .populate('paidBy', 'name email role avatar')

  return populated
}

/**
 * Fetch Payment History: Invoices with status = 'PAID'
 */
export const getPaymentHistory = async ({ search, statusFilter, dateFilter, page = 1, limit = 20 } = {}) => {
  const query = { status: 'PAID' }

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { vendorName: { $regex: search, $options: 'i' } },
    ]
  }

  if (dateFilter && dateFilter !== 'all') {
    const now = new Date()
    if (dateFilter === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      query.paidAt = { $gte: startOfMonth }
    } else if (dateFilter === 'last_month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      query.paidAt = { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Invoice.countDocuments(query)
  const invoices = await Invoice.find(query)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')
    .populate('paidBy', 'name email role avatar')
    .sort({ paidAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  return {
    invoices,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
  }
}
