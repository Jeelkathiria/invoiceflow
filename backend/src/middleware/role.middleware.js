import { errorResponse } from '../utils/apiResponse.js'

export const authorizeRoles = (...roles) => {
  const allowed = roles.map((r) => r.toLowerCase())
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toLowerCase()
    if (!req.user || !allowed.includes(userRole)) {
      return errorResponse(
        res,
        403,
        `User role '${req.user?.role}' is not authorized to perform this action`
      )
    }
    next()
  }
}
