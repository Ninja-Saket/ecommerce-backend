import express from 'express'
// middlewares
import {authCheck} from '../middlewares/auth.js'
// controllers
import { createUserCart, getUserCart, emptyUserCart, saveUserAddress} from '../controllers/user.js'
const router = express.Router()

router.post('/user/cart', authCheck, createUserCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyUserCart)
router.post('/user/address', authCheck, saveUserAddress)

export default router