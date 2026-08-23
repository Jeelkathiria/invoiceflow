import { Router } from 'express'
import { getFinanceTeam, getFinanceMemberDetails } from '../controllers/manager.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'

const router = Router()

// All routes require authentication and manager role
router.use(protect)
router.use(authorizeRoles('manager'))

router.get('/team', getFinanceTeam)
router.get('/team/:userId', getFinanceMemberDetails)

export default router
