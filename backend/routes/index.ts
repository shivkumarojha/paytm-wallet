import express from 'express'
import { router as userRouter } from './user'


const router = express.Router()

router.use('/user', userRouter)



export default router