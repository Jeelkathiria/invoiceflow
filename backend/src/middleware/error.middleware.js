import { errorResponse } from '../utils/apiResponse.js'

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err)

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return errorResponse(res, 400, `A record with this ${field} already exists`)
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message)
    return errorResponse(res, 400, messages.join(', '))
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Internal Server Error'

  return errorResponse(res, statusCode, message)
}
