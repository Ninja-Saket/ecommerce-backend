import express from 'express'
const router = express.Router()

// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'

// controllers
import {upload, remove} from '../controllers/cloudinary.js'

router.post('/uploadimages', authCheck, adminCheck, upload)
router.post('/removeimage', authCheck, adminCheck, remove)

export default router