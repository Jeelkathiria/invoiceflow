import jwt from 'jsonwebtoken'

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_invoiceflow_2026_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}
