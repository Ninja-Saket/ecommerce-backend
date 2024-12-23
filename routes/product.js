import express from 'express'
const router = express.Router()
// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'
// controllers
import { create,update,list,read,remove, sortedList, productsCount, productStar } from '../controllers/product.js'
// route

router.post('/product', authCheck, adminCheck, create)
router.get('/products/total', productsCount)
router.get('/products/:count', list)
router.delete('/product/:slug', authCheck, adminCheck, remove)
router.get('/product/:slug', read)
router.put('/product/:slug', authCheck, adminCheck, update)
router.post('/products', sortedList)
router.put('/product/star/:productId', authCheck, productStar)

export default router