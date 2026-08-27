import * as dashboardService from '../services/dashboard.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {
      // Fall through to direct error response
    }
  }
  console.error('[Dashboard Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Dashboard request failed'
  return errorResponse(res, statusCode, message)
}

export const getStats = async (req, res, next) => {
  try {
    const { timeframe, startDate, endDate } = req.query
    const stats = await dashboardService.getDashboardStats({
      user: req.user,
      timeframe,
      startDate,
      endDate,
    })
    return successResponse(res, 200, 'Dashboard statistics fetched', stats)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getRecentUploads = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const recent = await dashboardService.getRecentUploads({ user: req.user, limit })
    return successResponse(res, 200, 'Recent uploads fetched', recent)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getActivityTimeline = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const activity = await dashboardService.getActivityTimeline({ user: req.user, limit })
    return successResponse(res, 200, 'Activity timeline fetched', activity)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getFinanceTeamOverview = async (req, res, next) => {
  try {
    const role = (req.user?.role || '').toLowerCase()
    if (!role.includes('manager')) {
      return errorResponse(res, 403, 'Manager authorization required to view team overview')
    }
    const team = await dashboardService.getFinanceTeamOverview()
    return successResponse(res, 200, 'Finance team overview fetched', team)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getNeedsAttentionInvoices = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const invoices = await dashboardService.getNeedsAttentionInvoices(limit)
    return successResponse(res, 200, 'Invoices requiring attention fetched', invoices)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getRiskOverview = async (req, res, next) => {
  try {
    const risk = await dashboardService.getRiskOverview()
    return successResponse(res, 200, 'Risk and exception overview fetched', risk)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getAIInsights = async (req, res, next) => {
  try {
    const insights = await dashboardService.getAIInsights()
    return successResponse(res, 200, 'AI insights fetched', insights)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
