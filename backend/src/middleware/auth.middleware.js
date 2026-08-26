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

  // Handle Demo Tokens for seamless demo access
  if (token === 'demo-manager-jwt-token' || token.includes('demo-manager')) {
    let demoUser = await User.findOne({ role: 'manager' })
    if (!demoUser) {
      demoUser = await User.findOne({ email: 'manager@gmail.com' })
    }
    if (demoUser) {
      req.user = demoUser
      return next()
    } else {
      req.user = {
        _id: '650000000000000000000001',
        name: 'Finance Manager',
        email: 'manager@gmail.com',
        role: 'manager',
      }
      return next()
    }
  }

  if (token === 'demo-finance-jwt-token' || token.includes('demo-finance')) {
    let demoUser = await User.findOne({ role: 'finance' })
    if (demoUser) {
      req.user = demoUser
      return next()
    } else {
      req.user = {
        _id: '650000000000000000000002',
        name: 'Finance Executive',
        email: 'finance@gmail.com',
        role: 'finance',
      }
      return next()
    }
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
