import { validationResult } from 'express-validator'
import { errorResponse } from '../utils/apiResponse.js'

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }))
    return errorResponse(res, 400, 'Validation error', formattedErrors)
  }
  next()
}
