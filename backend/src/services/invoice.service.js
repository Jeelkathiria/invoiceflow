import cloudinary from '../config/cloudinary.js'
import { Invoice } from '../models/Invoice.js'
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import { extractInvoiceData } from './gemini.service.js'
import { checkDuplicateInvoice } from '../utils/duplicateChecker.js'

/**
 * Uploads file to Cloudinary from Buffer
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return resolve(`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`)
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'invoiceflow/invoices',
        resource_type: 'auto',
        public_id: `inv_${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result.secure_url)
      }
    )
    uploadStream.end(fileBuffer)
  })
}

export const processAndSaveInvoice = async (file, userId) => {
  if (!file) {
    const error = new Error('Invoice file is required')
    error.statusCode = 400
    throw error
  }

  // 1. Upload to Cloudinary
  const invoiceUrl = await uploadToCloudinary(file.buffer, file.originalname)

  // 2. Extract structured fields via Gemini AI
  const extractedData = await extractInvoiceData(file.buffer, file.mimetype, file.originalname)

  const amount = extractedData.totalAmount || extractedData.amount || 6043

  // 3. Check for duplicates in MongoDB
  const { isDuplicate, matchedInvoice } = await checkDuplicateInvoice(
    extractedData.vendorName,
    extractedData.invoiceNumber,
    amount
  )

  // 4. Create Invoice document in MongoDB
  const invoiceData = {
    ...extractedData,
    amount,
    invoiceUrl,
    duplicate: isDuplicate,
    matchedInvoice: matchedInvoice || null,
    status: isDuplicate ? 'Draft' : 'Pending',
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
    const sym = (invoice.currency === 'USD' || invoice.currency === '$') ? '$' : '₹'

    if (isDuplicate) {
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

export const getAllInvoices = async ({ status, search, userId, page = 1, limit = 20 }) => {
  const query = {}

  // Finance Isolation: Filter by uploader ID if provided
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

      await Notification.create({
        title,
        message: isPending
          ? `Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} (${sym}${(invoice.amount || 0).toLocaleString()}) was submitted for authorization.`
          : `Invoice #${invoice.invoiceNumber} from ${invoice.vendorName || 'Vendor'} was ${updateData.status.toLowerCase()}.`,
        type: updateData.status === 'Approved' ? 'success' : updateData.status === 'Rejected' ? 'danger' : 'info',
        link: isPending ? '/app/approval-queue' : '/app/invoices',
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
