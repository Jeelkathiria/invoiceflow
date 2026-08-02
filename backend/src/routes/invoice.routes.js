import { Router } from 'express'
import {
  uploadInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  deleteDraftInvoices,
} from '../controllers/invoice.controller.js'
import { protect, optionalAuth } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

// Public / Optional Auth Routes
router.post('/upload', optionalAuth, upload.single('invoice'), uploadInvoice)
router.get('/', optionalAuth, getInvoices)
router.delete('/drafts/cleanup', optionalAuth, deleteDraftInvoices)
router.get('/:id', optionalAuth, getInvoiceById)
router.put('/:id', optionalAuth, updateInvoice)
router.delete('/:id', optionalAuth, deleteInvoice)

export default router
