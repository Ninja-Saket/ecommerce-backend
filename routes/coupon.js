import express from 'express'
const router = express.Router()
// middlewares
import { authCheck, adminCheck } from '../middlewares/auth.js'

// controllers
import { create, remove, list} from '../controllers/coupon.js'

router.post('/coupon', authCheck, adminCheck, create)
router.get('/coupons', list)
router.delete('/coupon/:couponId', authCheck, adminCheck, remove)

export default router