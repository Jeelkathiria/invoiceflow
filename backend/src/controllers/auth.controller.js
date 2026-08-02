import * as authService from '../services/auth.service.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

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
    next(error)
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
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id)
    return successResponse(res, 200, 'User profile fetched successfully', user)
  } catch (error) {
    next(error)
  }
}
