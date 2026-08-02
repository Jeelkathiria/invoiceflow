import { Notification } from '../models/Notification.js'

export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 })
}

export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  )
  if (!notification) {
    const error = new Error('Notification not found')
    error.statusCode = 404
    throw error
  }
  return notification
}
