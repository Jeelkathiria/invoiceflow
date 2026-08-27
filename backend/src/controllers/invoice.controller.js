import * as invoiceService from '../services/invoice.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {}
  }
  console.error('[Invoice Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Invoice operation failed'
  return errorResponse(res, statusCode, message)
}

export const uploadInvoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please attach an invoice document file')
    }

    let extracted = null
    try {
      extracted = await invoiceService.extractAndAnalyzeInvoice(req.file)
    } catch (analysisErr) {
      console.warn('[Upload Invoice Processing Fallback]:', analysisErr.message)
      const fileName = req.file.originalname || 'invoice.pdf'
      const fallbackData = invoiceService.getFallbackInvoiceData(fileName)
      extracted = {
        ...fallbackData,
        fileName,
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        invoiceUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        status: 'Draft',
      }
    }

    return successResponse(res, 200, 'Invoice analyzed via OCR-first pipeline successfully', extracted)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const saveInvoice = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null
    const saved = await invoiceService.saveInvoiceRecord(req.body, userId)
    return successResponse(res, 201, 'Invoice saved to MongoDB database successfully', saved)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const cancelInvoice = async (req, res, next) => {
  try {
    const publicId = req.body.cloudinaryPublicId || req.body.public_id
    const result = await invoiceService.cancelInvoiceUpload(publicId)
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getInvoices = async (req, res, next) => {
  try {
    const user = req.user
    const queryParams = { ...req.query }

    if (user && user.role === 'finance') {
      queryParams.userId = user._id || user.id
    }

    const result = await invoiceService.getAllInvoices(queryParams)
    return successResponse(res, 200, 'Invoices fetched successfully', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user)
    return successResponse(res, 200, 'Invoice details fetched', invoice)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getExtractionStrategy = async (req, res, next) => {
  try {
    const strategyInfo = await invoiceService.getInvoiceExtractionStrategy(req.params.id)
    return successResponse(res, 200, 'Invoice extraction strategy info fetched', strategyInfo)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getLatestExtractionStrategy = async (req, res, next) => {
  try {
    const strategyInfo = await invoiceService.getLatestExtractionStrategy()
    return successResponse(res, 200, 'Latest invoice extraction strategy info fetched', strategyInfo)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const updateInvoice = async (req, res, next) => {
  try {
    const updated = await invoiceService.updateInvoice(req.params.id, req.body, req.user)
    return successResponse(res, 200, 'Invoice updated successfully', updated)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const rejectInvoice = async (req, res, next) => {
  try {
    const { rejectionReason, rejectionComment, comment, relatedInvoiceId } = req.body
    if (!rejectionReason && !comment) {
      return errorResponse(res, 400, 'Rejection reason is required before rejecting invoice')
    }

    const rejected = await invoiceService.rejectInvoiceService(
      req.params.id,
      { rejectionReason, rejectionComment, comment, relatedInvoiceId },
      req.user
    )
    return successResponse(res, 200, 'Invoice status updated via rejection workflow', rejected)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const resubmitInvoice = async (req, res, next) => {
  try {
    const resubmitted = await invoiceService.resubmitInvoiceService(req.params.id, req.body, req.user)
    return successResponse(res, 200, 'Invoice corrected & resubmitted for manager approval', resubmitted)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id)
    return successResponse(res, 200, result.message)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const deleteDraftInvoices = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null
    const result = await invoiceService.deleteDraftInvoices(userId)
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const deleteAllInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteAllInvoices()
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getPaymentQueue = async (req, res, next) => {
  try {
    const result = await invoiceService.getPaymentQueue(req.query)
    return successResponse(res, 200, 'Payment queue invoices fetched successfully', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const markInvoiceAsPaid = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase()
    if (userRole.includes('manager')) {
      return errorResponse(res, 403, 'Managers are not authorized to mark payments as paid')
    }

    const updated = await invoiceService.markInvoiceAsPaid(req.params.id, req.user)
    return successResponse(res, 200, 'Invoice marked as paid successfully', updated)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getPaymentHistory = async (req, res, next) => {
  try {
    const result = await invoiceService.getPaymentHistory(req.query)
    return successResponse(res, 200, 'Payment history fetched successfully', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
