import { User } from '../models/User.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {}
  }
  console.error('[Profile Controller Error]:', err)
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Profile operation failed'
  return errorResponse(res, statusCode, message)
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    return successResponse(res, 200, 'Profile fetched successfully', user)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return errorResponse(res, 404, 'User not found')

    if (name) user.name = name
    if (avatar) user.avatar = avatar

    await user.save()
    return successResponse(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    })
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide both current and new password')
    }

    if (currentPassword === newPassword) {
      return errorResponse(res, 400, 'New password cannot be the same as current password')
    }

    const user = await User.findById(req.user._id)
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect')
    }

    user.password = newPassword
    await user.save()

    return successResponse(res, 200, 'Password updated successfully')
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}
