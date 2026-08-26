import { User } from '../models/User.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    return successResponse(res, 200, 'Profile fetched successfully', user)
  } catch (error) {
    next(error)
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
    next(error)
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
    next(error)
  }
}
