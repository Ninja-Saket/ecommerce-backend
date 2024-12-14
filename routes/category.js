import express from 'express'
const router = express.Router()
// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'
// controllers
import { create,update,list,read,remove } from '../controllers/category.js'
// route

router.post('/category', authCheck, adminCheck, create)
router.get('/category', list)
router.get('/category/:slug',read)
router.put('/category/:slug', authCheck, adminCheck, update)
router.delete('/category/:slug', authCheck, adminCheck, remove)

export default router