import * as approvalService from '../services/approval.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {}
  }
  console.error('[Approval Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Approval operation failed'
  return errorResponse(res, statusCode, message)
}

export const getPendingApprovals = async (req, res, next) => {
  try {
    const queue = await approvalService.getPendingApprovals()
    return successResponse(res, 200, 'Pending approval queue fetched', queue)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const approveInvoice = async (req, res, next) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const result = await approvalService.approveInvoice(id, req.user._id, comment)
    return successResponse(res, 200, 'Invoice approved successfully', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const rejectInvoice = async (req, res, next) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const result = await approvalService.rejectInvoice(id, req.user._id, comment)
    return successResponse(res, 200, 'Invoice rejected', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
