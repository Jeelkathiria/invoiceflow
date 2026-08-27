import * as authService from '../services/auth.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

const handleControllerError = (err, res, next) => {
  if (typeof next === 'function') {
    try {
      return next(err)
    } catch (e) {
      // Fall through to explicit JSON response if next throws or is unavailable
    }
  }
  console.error('[Auth Controller Error]:', err)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return errorResponse(res, 400, `An account with this ${field} already exists`)
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message)
    return errorResponse(res, 400, messages.join(', '))
  }
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Authentication operation failed'
  return errorResponse(res, statusCode, message)
}

export const signup = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body)
    
    // Set HTTP cookie option
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return successResponse(res, 201, 'User registered successfully', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body)

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return successResponse(res, 200, 'Login successful', result)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id)
    return successResponse(res, 200, 'User profile fetched successfully', user)
  } catch (error) {
    return handleControllerError(error, res, next)
  }
}

