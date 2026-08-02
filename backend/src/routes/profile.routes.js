import { Router } from 'express'
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/', getProfile)
router.put('/', updateProfile)
router.put('/password', updatePassword)

export default router
