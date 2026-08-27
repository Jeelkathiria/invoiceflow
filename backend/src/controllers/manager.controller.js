import * as managerService from '../services/manager.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {}
  }
  console.error('[Manager Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Manager operation failed'
  return errorResponse(res, statusCode, message)
}

export const getFinanceTeam = async (req, res, next) => {
  try {
    const role = (req.user?.role || '').toLowerCase()
    if (!role.includes('manager')) {
      return errorResponse(res, 403, 'Manager authorization required')
    }

    const team = await managerService.getFinanceTeamList()
    return successResponse(res, 200, 'Finance team list retrieved successfully', team)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getFinanceMemberDetails = async (req, res, next) => {
  try {
    const role = (req.user?.role || '').toLowerCase()
    if (!role.includes('manager')) {
      return errorResponse(res, 403, 'Manager authorization required')
    }

    const { userId } = req.params
    const details = await managerService.getFinanceMemberDetails(userId)
    return successResponse(res, 200, 'Finance member details retrieved successfully', details)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
