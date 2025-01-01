import express from 'express'
import {createRazorpayOrder, verifyPayment} from '../controllers/razorpay.js'
const router = express.Router()

// middleware
import {authCheck} from '../middlewares/auth.js'

router.post('/create-razorpay-order', authCheck, createRazorpayOrder)
router.post('/payment-verification', verifyPayment)

export default router
