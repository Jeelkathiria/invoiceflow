import * as invoiceService from '../services/invoice.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const uploadInvoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please attach an invoice document file')
    }

    const extracted = await invoiceService.extractAndAnalyzeInvoice(req.file)
    return successResponse(res, 200, 'Invoice analyzed via OCR-first pipeline successfully', extracted)
  } catch (error) {
    console.error('[Upload Invoice Controller Error]:', error)
    next(error)
  }
}

export const saveInvoice = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null
    const saved = await invoiceService.saveInvoiceRecord(req.body, userId)
    return successResponse(res, 201, 'Invoice saved to MongoDB database successfully', saved)
  } catch (error) {
    next(error)
  }
}

export const cancelInvoice = async (req, res, next) => {
  try {
    const publicId = req.body.cloudinaryPublicId || req.body.public_id
    const result = await invoiceService.cancelInvoiceUpload(publicId)
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    next(error)
  }
}

export const getInvoices = async (req, res, next) => {
  try {
    const user = req.user
    const queryParams = { ...req.query }

    // DATA ISOLATION RULE:
    // Finance users see ONLY their own uploaded invoices.
    // Manager user sees ALL submitted invoices from every finance user.
    if (user && user.role === 'finance') {
      queryParams.userId = user._id || user.id
    }

    const result = await invoiceService.getAllInvoices(queryParams)
    return successResponse(res, 200, 'Invoices fetched successfully', result)
  } catch (error) {
    next(error)
  }
}

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id)
    return successResponse(res, 200, 'Invoice details fetched', invoice)
  } catch (error) {
    next(error)
  }
}

export const getExtractionStrategy = async (req, res, next) => {
  try {
    const strategyInfo = await invoiceService.getInvoiceExtractionStrategy(req.params.id)
    return successResponse(res, 200, 'Invoice extraction strategy info fetched', strategyInfo)
  } catch (error) {
    next(error)
  }
}

export const getLatestExtractionStrategy = async (req, res, next) => {
  try {
    const strategyInfo = await invoiceService.getLatestExtractionStrategy()
    return successResponse(res, 200, 'Latest invoice extraction strategy info fetched', strategyInfo)
  } catch (error) {
    next(error)
  }
}

export const updateInvoice = async (req, res, next) => {
  try {
    const updated = await invoiceService.updateInvoice(req.params.id, req.body)
    return successResponse(res, 200, 'Invoice updated successfully', updated)
  } catch (error) {
    next(error)
  }
}

export const deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id)
    return successResponse(res, 200, result.message)
  } catch (error) {
    next(error)
  }
}

export const deleteDraftInvoices = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null
    const result = await invoiceService.deleteDraftInvoices(userId)
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    next(error)
  }
}

export const deleteAllInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteAllInvoices()
    return successResponse(res, 200, result.message, result)
  } catch (error) {
    next(error)
  }
}
