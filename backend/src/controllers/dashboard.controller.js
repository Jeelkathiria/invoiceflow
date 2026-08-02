import * as dashboardService from '../services/dashboard.service.js'
import { successResponse } from '../utils/apiResponse.js'

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats()
    return successResponse(res, 200, 'Dashboard statistics fetched', stats)
  } catch (error) {
    next(error)
  }
}

export const getRecentUploads = async (req, res, next) => {
  try {
    const recent = await dashboardService.getRecentUploads()
    return successResponse(res, 200, 'Recent uploads fetched', recent)
  } catch (error) {
    next(error)
  }
}

export const getActivityTimeline = async (req, res, next) => {
  try {
    const activity = await dashboardService.getActivityTimeline()
    return successResponse(res, 200, 'Activity timeline fetched', activity)
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
