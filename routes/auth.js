import express from 'express'
const router = express.Router()
// middlewares
import {authCheck, adminCheck} from '../middlewares/auth.js'
// controllers
import { createOrUpdateUser, currentUser } from '../controllers/auth.js'
// route
router.post('/create-or-update-user', authCheck, createOrUpdateUser)
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin', authCheck, adminCheck, currentUser)

// testMiddleware
const testMiddleware = (req,res,next) => {
    console.log('I am a middleware');
    next()
}

router.get('/testingMiddleware', testMiddleware, (req,res)=> {
    return res.send({data : 'I passed the middleware test'})
})

export default router