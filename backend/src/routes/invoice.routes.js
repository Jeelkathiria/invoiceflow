import { Router } from 'express'
import {
  uploadInvoice,
  saveInvoice,
  cancelInvoice,
  getInvoices,
  getInvoiceById,
  getExtractionStrategy,
  getLatestExtractionStrategy,
  updateInvoice,
  deleteInvoice,
  deleteDraftInvoices,
  deleteAllInvoices,
} from '../controllers/invoice.controller.js'
import { protect, optionalAuth } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

// Public / Optional Auth Routes
router.post('/upload', optionalAuth, upload.single('invoice'), uploadInvoice)
router.post('/save', optionalAuth, saveInvoice)
router.post('/cancel', optionalAuth, cancelInvoice)
router.get('/', optionalAuth, getInvoices)
router.get('/strategy/latest', optionalAuth, getLatestExtractionStrategy)
router.get('/:id/strategy', optionalAuth, getExtractionStrategy)
router.delete('/drafts/cleanup', optionalAuth, deleteDraftInvoices)
router.delete('/clear-all', optionalAuth, deleteAllInvoices)
router.get('/:id', optionalAuth, getInvoiceById)
router.put('/:id', optionalAuth, updateInvoice)
router.delete('/:id', optionalAuth, deleteInvoice)

export default router
