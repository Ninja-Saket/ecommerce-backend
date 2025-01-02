import express from 'express'
const router = express.Router()
// middlewares
import { authCheck, adminCheck } from '../middlewares/auth.js'
// controllers
import { getOrders, orderStatus } from '../controllers/admin.js'

// routes
router.get('/admin/orders', authCheck, adminCheck, getOrders)
router.put('/admin/order-status', authCheck, adminCheck, orderStatus)

export default router