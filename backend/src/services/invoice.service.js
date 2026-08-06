import cloudinary from '../config/cloudinary.js'
import { Invoice } from '../models/Invoice.js'
import { Notification } from '../models/Notification.js'
import { ApprovalLog } from '../models/ApprovalLog.js'
import { User } from '../models/User.js'
import { extractInvoiceData } from './gemini.service.js'
import { runOCR } from './ocr.service.js'
import { evaluateOCRQuality, computeMissingFields } from '../utils/ocrParser.js'
import { checkDuplicateInvoice } from '../utils/duplicateChecker.js'

/**
 * Uploads file to Cloudinary from Buffer, returning both secure_url and public_id
 */
export const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      const mockPublicId = `inv_${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}`
      return resolve({
        secure_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
        public_id: mockPublicId,
      })
    }

    const publicId = `inv_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9]/g, '_')}`

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'invoiceflow/invoices',
        resource_type: 'auto',
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      }
    )
    uploadStream.end(fileBuffer)
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
 * Uploads to Cloudinary -> Runs Tesseract.js OCR -> Evaluates Rule Engine ->
 * Branches to OCR_ONLY or OCR_FALLBACK_GEMINI -> Runs Duplicate Checker ->
 * Returns extracted JSON preview WITHOUT saving to MongoDB yet.
 */
export const extractAndAnalyzeInvoice = async (file) => {
  if (!file) {
    const error = new Error('Invoice file is required for extraction')
    error.statusCode = 400
    throw error
  }

  const startTime = Date.now()
  console.log(`[Extraction Pipeline]: Step 1 - Uploading original document "${file.originalname}" to Cloudinary...`)

  // 1. Upload Original Document to Cloudinary
  const { secure_url: invoiceUrl, public_id: cloudinaryPublicId } = await uploadToCloudinary(
    file.buffer,
    file.originalname
  )

  console.log(`[Extraction Pipeline]: Step 2 - Running Tesseract.js OCR engine...`)

  // 2. OCR (Tesseract.js)
  const ocrResult = await runOCR(file.buffer, file.mimetype)

  // 3. Backend Validation & Rule Engine Evaluation
  console.log(`[Extraction Pipeline]: Step 3 - Running Rule Engine & Table Parser...`)
  const evaluation = evaluateOCRQuality(ocrResult.rawText, ocrResult.ocrConfidence, ocrResult.lines)

  let extractedData = null
  let strategy = evaluation.strategy
  let extractionSource = evaluation.extractionSource

  if (evaluation.isHighConfidence) {
    console.log(`\n==================================================`)
    console.log(`🚀 [INVOICE EXTRACTION]: EXTRACTED BY LOCAL OCR (Tesseract.js)`)
    console.log(`   Strategy: OCR_ONLY | Source: OCR | Confidence: ${ocrResult.ocrConfidence}%`)
    console.log(`==================================================\n`)
    extractedData = evaluation.parsedData
  } else {
    console.log(`\n==================================================`)
    console.log(`🤖 [INVOICE EXTRACTION]: EXTRACTED BY GEMINI VISION (AI Fallback)`)
    console.log(`   Strategy: OCR_FALLBACK_GEMINI | Source: GEMINI`)
    console.log(`   Reasons for Gemini Fallback:`)
    evaluation.validationErrors.forEach((err, idx) => console.log(`   ${idx + 1}. ${err}`))
    console.log(`==================================================\n`)

    // Call Gemini Vision fallback
    const geminiData = await extractInvoiceData(file.buffer, file.mimetype, file.originalname)
    extractedData = geminiData
    strategy = 'OCR_FALLBACK_GEMINI'
    extractionSource = 'GEMINI'
  }

  // Compute Missing Fields Reporting
  const { missingMandatoryFields, missingOptionalFields } = computeMissingFields(extractedData)
  console.log(`[Missing Field Reporting]:`)
  console.log(`   Missing Mandatory: [${missingMandatoryFields.join(', ')}]`)
  console.log(`   Missing Optional:  [${missingOptionalFields.join(', ')}]`)

  const amount = Number(extractedData.totalAmount || extractedData.amount || 0)

  // 4. Duplicate Detection Engine
  console.log(`[Extraction Pipeline]: Step 4 - Running Duplicate Detection Engine...`)
  const { isDuplicate, matchedInvoice } = await checkDuplicateInvoice(
    extractedData.vendorName,
    extractedData.invoiceNumber,
    amount
  )

  // 5. Generate Extraction Report
  const processingTime = Date.now() - startTime
  const extractionReport = {
    strategy,
    extractionSource,
    ocrConfidence: ocrResult.ocrConfidence,
    missingMandatoryFields,
    missingOptionalFields,
    duplicateFlag: isDuplicate,
    validationErrors: evaluation.validationErrors || [],
    processingTimeMs: processingTime,
  }

  console.log(`[Extraction Pipeline]: Completed in ${processingTime}ms (Strategy: ${strategy}, Duplicate: ${isDuplicate})`)

  return {
    ...extractedData,
    amount,
    invoiceUrl,
    cloudinaryPublicId,
    strategy,
    extractionSource,
    ocrConfidence: ocrResult.ocrConfidence,
    missingMandatoryFields,
    missingOptionalFields,
    duplicate: isDuplicate,
    matchedInvoice: matchedInvoice || null,
    status: isDuplicate ? 'Draft' : 'Pending',
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
    status: invoicePayload.status || (invoicePayload.duplicate ? 'Draft' : 'Pending'),
    missingMandatoryFields: Array.isArray(invoicePayload.missingMandatoryFields) ? invoicePayload.missingMandatoryFields : [],
    missingOptionalFields: Array.isArray(invoicePayload.missingOptionalFields) ? invoicePayload.missingOptionalFields : [],
    lineItems: sanitizedLineItems,
  }

  if (userId) {
    invoiceData.uploadedBy = userId
  }

  const invoice = await Invoice.create(invoiceData)
  console.log(`[MongoDB Persistence]: Saved Invoice ID ${invoice._id} for Vendor "${invoice.vendorName}" by User ${userId || 'anonymous'}`)

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
    query.status = status
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

export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('uploadedBy', 'name email role avatar')
    .populate('approvedBy', 'name email role avatar')

  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
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

export const updateInvoice = async (id, updateData) => {
  const invoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
  if (!invoice) {
    const error = new Error('Invoice not found')
    error.statusCode = 404
    throw error
  }

  if (updateData.status && (updateData.status === 'Approved' || updateData.status === 'Rejected' || updateData.status === 'Pending')) {
    try {
      const isPending = updateData.status === 'Pending'
      const recipientRole = isPending ? 'manager' : 'finance'
      const title = isPending ? 'Invoice Submitted for Approval' : `Invoice ${updateData.status}`
      const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'

      const reasonText = invoice.rejectionReason || (updateData.comments && updateData.comments[0]) || ''
      const notificationMessage = isPending
        ? `Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} (${sym}${(invoice.amount || 0).toLocaleString()}) was submitted for authorization.`
        : updateData.status === 'Rejected'
        ? `Invoice #${invoice.invoiceNumber} was rejected.${reasonText ? ` Reason: "${reasonText}"` : ''}`
        : `Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} was approved.`

      await Notification.create({
        title,
        message: notificationMessage,
        type: updateData.status === 'Approved' ? 'success' : updateData.status === 'Rejected' ? 'danger' : 'info',
        link: isPending ? '/app/approval-queue' : `/app/invoice/${invoice._id}`,
        recipientRole,
        user: isPending ? null : (invoice.uploadedBy || null),
      })
    } catch (err) {
      console.warn('Notification trigger error:', err.message)
    }
  }

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
