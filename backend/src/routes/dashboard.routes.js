import { Router } from 'express'
import {
  getStats,
  getRecentUploads,
  getActivityTimeline,
  getFinanceTeamOverview,
  getNeedsAttentionInvoices,
  getRiskOverview,
  getAIInsights,
} from '../controllers/dashboard.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/stats', getStats)
router.get('/recent', getRecentUploads)
router.get('/activity', getActivityTimeline)
router.get('/team', getFinanceTeamOverview)
router.get('/attention', getNeedsAttentionInvoices)
router.get('/risk-overview', getRiskOverview)
router.get('/insights', getAIInsights)

export default router
