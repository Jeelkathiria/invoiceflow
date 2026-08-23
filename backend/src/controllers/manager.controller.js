import * as managerService from '../services/manager.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getFinanceTeam = async (req, res, next) => {
  try {
    const role = (req.user?.role || '').toLowerCase()
    if (!role.includes('manager')) {
      return errorResponse(res, 403, 'Manager authorization required')
    }

    const team = await managerService.getFinanceTeamList()
    return successResponse(res, 200, 'Finance team list retrieved successfully', team)
  } catch (error) {
    next(error)
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
    next(error)
  }
}
