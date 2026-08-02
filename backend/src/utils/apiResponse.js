/**
 * Formats a successful API response
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * Formats an error API response
 */
export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const payload = {
    success: false,
    message,
  }
  if (errors) {
    payload.errors = errors
  }
  return res.status(statusCode).json(payload)
}
