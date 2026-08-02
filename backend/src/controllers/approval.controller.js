import * as approvalService from '../services/approval.service.js'
import { successResponse } from '../utils/apiResponse.js'

export const getPendingApprovals = async (req, res, next) => {
  try {
    const queue = await approvalService.getPendingApprovals()
    return successResponse(res, 200, 'Pending approval queue fetched', queue)
  } catch (error) {
    next(error)
  }
}

export const approveInvoice = async (req, res, next) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const result = await approvalService.approveInvoice(id, req.user._id, comment)
    return successResponse(res, 200, 'Invoice approved successfully', result)
  } catch (error) {
    next(error)
  }
}

export const rejectInvoice = async (req, res, next) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const result = await approvalService.rejectInvoice(id, req.user._id, comment)
    return successResponse(res, 200, 'Invoice rejected', result)
  } catch (error) {
    next(error)
  }
}
