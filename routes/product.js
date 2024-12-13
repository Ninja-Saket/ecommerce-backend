import express from 'express'
const router = express.Router()
// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'
// controllers
import { create,update,list,read,remove } from '../controllers/product.js'
// route

router.post('/product', authCheck, adminCheck, create)
router.get('/products/:count', list)
router.delete('/product/:slug', authCheck, adminCheck, remove)

export default router