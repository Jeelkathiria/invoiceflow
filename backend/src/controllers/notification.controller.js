import { Notification } from '../models/Notification.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {}
  }
  console.error('[Notification Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Notification operation failed'
  return errorResponse(res, statusCode, message)
}

// Get all notifications for user/role
export const getNotifications = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || 'finance').toLowerCase()
    const userId = req.user?._id

    const query = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: userRole },
        ...(userId ? [{ user: userId }] : []),
      ],
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20)
    const unreadCount = notifications.length

    return successResponse(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
    })
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

// Mark single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params
    const notification = await Notification.findByIdAndDelete(id)

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found')
    }

    return successResponse(res, 200, 'Notification seen and removed', { id })
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || 'finance').toLowerCase()
    const userId = req.user?._id

    const query = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: userRole },
        ...(userId ? [{ user: userId }] : []),
      ],
    }

    await Notification.deleteMany(query)

    return successResponse(res, 200, 'All notifications seen and removed')
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

// Delete a single notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndDelete(id)
    return successResponse(res, 200, 'Notification deleted successfully')
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

// Clear all notifications
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({})
    return successResponse(res, 200, 'All notifications cleared')
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
