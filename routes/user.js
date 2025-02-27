import express from 'express'
// middlewares
import {authCheck} from '../middlewares/auth.js'
// controllers
import { createUserCart, getUserCart, emptyUserCart, saveUserAddress, applyCouponToUserCart, createOrder, listOrders, addToWishlist, wishlist, removeFromWishlist, createCodOrder} from '../controllers/user.js'
const router = express.Router()

router.post('/user/cart', authCheck, createUserCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyUserCart)
router.post('/user/address', authCheck, saveUserAddress)
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart)
router.post('/user/order', authCheck, createOrder)
router.post('/user/cod-order', authCheck, createCodOrder)
router.get('/user/orders', authCheck, listOrders)

// wishlist
router.post('/user/wishlist', authCheck, addToWishlist)
router.get('/user/wishlist', authCheck, wishlist)
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist)

export default router