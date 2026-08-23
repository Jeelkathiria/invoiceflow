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
  rejectInvoice,
  resubmitInvoice,
  deleteInvoice,
  deleteDraftInvoices,
  deleteAllInvoices,
  getPaymentQueue,
  markInvoiceAsPaid,
  getPaymentHistory,
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
router.get('/payment-queue', optionalAuth, getPaymentQueue)
router.get('/payment-history', optionalAuth, getPaymentHistory)
router.get('/strategy/latest', optionalAuth, getLatestExtractionStrategy)
router.get('/:id/strategy', optionalAuth, getExtractionStrategy)
router.delete('/drafts/cleanup', optionalAuth, deleteDraftInvoices)
router.delete('/clear-all', optionalAuth, deleteAllInvoices)
router.patch('/:id/mark-paid', optionalAuth, markInvoiceAsPaid)
router.put('/:id/mark-paid', optionalAuth, markInvoiceAsPaid)
router.get('/:id', optionalAuth, getInvoiceById)
router.put('/:id/reject', optionalAuth, rejectInvoice)
router.put('/:id/resubmit', optionalAuth, resubmitInvoice)
router.put('/:id', optionalAuth, updateInvoice)
router.delete('/:id', optionalAuth, deleteInvoice)

export default router
