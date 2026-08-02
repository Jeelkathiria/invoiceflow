import { Router } from 'express'
import {
  getStats,
  getRecentUploads,
  getActivityTimeline,
  getAIInsights,
} from '../controllers/dashboard.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/stats', getStats)
router.get('/recent', getRecentUploads)
router.get('/activity', getActivityTimeline)
router.get('/insights', getAIInsights)

export default router
