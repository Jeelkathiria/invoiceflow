import { Router } from 'express'
import { signup, login, getMe } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate.middleware.js'
import { signupValidator, loginValidator } from '../validators/auth.validator.js'

const router = Router()

router.post('/signup', signupValidator, validateRequest, signup)
router.post('/login', loginValidator, validateRequest, login)
router.get('/me', protect, getMe)

export default router
