import express from 'express'
const router = express.Router()
// middlewares
import {authCheck} from '../middlewares/auth.js'
// controllers
import { createOrUpdateUser } from '../controllers/auth.js'
// route
router.post('/create-or-update-user', authCheck, createOrUpdateUser)

// testMiddleware
const testMiddleware = (req,res,next) => {
    console.log('I am a middleware');
    next()
}

router.get('/testingMiddleware', testMiddleware, (req,res)=> {
    return res.send({data : 'I passed the middleware test'})
})

export default router