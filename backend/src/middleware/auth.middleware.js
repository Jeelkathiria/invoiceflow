import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { errorResponse } from '../utils/apiResponse.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, token missing')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_invoiceflow_2026_prod')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists')
    }

    req.user = user
    next()
  } catch (error) {
    return errorResponse(res, 401, 'Token invalid or expired')
  }
}

export const optionalAuth = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_invoiceflow_2026_prod')
      const user = await User.findById(decoded.id).select('-password')
      if (user) {
        req.user = user
      }
    } catch (error) {
      // Proceed without req.user if token is invalid or expired
    }
  }

  next()
}
