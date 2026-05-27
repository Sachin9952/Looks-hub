import express from 'express'
import { getDashboardStats } from '../controllers/dashboardController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats', protectAdmin, getDashboardStats)

export default router
