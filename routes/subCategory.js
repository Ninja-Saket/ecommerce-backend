import express from 'express'
const router = express.Router()
// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'
// controllers
import { create,update,list,read,remove } from '../controllers/subCategory.js'
// route

router.post('/subCategory', authCheck, adminCheck, create)
router.get('/subCategories', list)
router.get('/subCategory/:slug',read)
router.put('/subCategory/:slug', authCheck, adminCheck, update)
router.delete('/subCategory/:slug', authCheck, adminCheck, remove)

export default router