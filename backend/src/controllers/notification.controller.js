import { Notification } from '../models/Notification.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// Get all notifications for user/role
export const getNotifications = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || 'finance').toLowerCase()
    const userId = req.user?._id

    // Fetch notifications targeting the user or user's role or 'all'
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
    next(error)
  }
}

// Mark single notification as read (Deletes from MongoDB once seen)
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params
    const notification = await Notification.findByIdAndDelete(id)

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found')
    }

    return successResponse(res, 200, 'Notification seen and removed', { id })
  } catch (error) {
    next(error)
  }
}

// Mark all notifications as read (Deletes all notifications for user/role once seen)
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
    next(error)
  }
}

// Delete a single notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndDelete(id)
    return successResponse(res, 200, 'Notification deleted successfully')
  } catch (error) {
    next(error)
  }
}

// Clear all notifications
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({})
    return successResponse(res, 200, 'All notifications cleared')
  } catch (error) {
    next(error)
  }
}
