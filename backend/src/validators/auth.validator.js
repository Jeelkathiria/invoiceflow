import { body } from 'express-validator'

export const signupValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid work email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['finance', 'manager', 'Finance', 'Manager']).withMessage('Role must be finance or manager'),
]

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]
