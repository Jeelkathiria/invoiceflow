import * as dashboardService from '../services/dashboard.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

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
    next(error)
  }
}

export const getRecentUploads = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const recent = await dashboardService.getRecentUploads({ user: req.user, limit })
    return successResponse(res, 200, 'Recent uploads fetched', recent)
  } catch (error) {
    next(error)
  }
}

export const getActivityTimeline = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const activity = await dashboardService.getActivityTimeline({ user: req.user, limit })
    return successResponse(res, 200, 'Activity timeline fetched', activity)
  } catch (error) {
    next(error)
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
    next(error)
  }
}

export const getNeedsAttentionInvoices = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const invoices = await dashboardService.getNeedsAttentionInvoices(limit)
    return successResponse(res, 200, 'Invoices requiring attention fetched', invoices)
  } catch (error) {
    next(error)
  }
}

export const getRiskOverview = async (req, res, next) => {
  try {
    const risk = await dashboardService.getRiskOverview()
    return successResponse(res, 200, 'Risk and exception overview fetched', risk)
  } catch (error) {
    next(error)
  }
}

export const getAIInsights = async (req, res, next) => {
  try {
    const insights = await dashboardService.getAIInsights()
    return successResponse(res, 200, 'AI insights fetched', insights)
  } catch (error) {
    next(error)
  }
}
