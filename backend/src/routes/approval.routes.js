import { Router } from 'express'
import {
  getPendingApprovals,
  approveInvoice,
  rejectInvoice,
} from '../controllers/approval.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validate.middleware.js'
import { approvalValidator } from '../validators/invoice.validator.js'

const router = Router()

router.use(protect)

router.get('/', authorizeRoles('Admin', 'Manager', 'Finance'), getPendingApprovals)
router.put('/:id/approve', authorizeRoles('Admin', 'Manager'), approvalValidator, validateRequest, approveInvoice)
router.put('/:id/reject', authorizeRoles('Admin', 'Manager'), approvalValidator, validateRequest, rejectInvoice)

export default router
