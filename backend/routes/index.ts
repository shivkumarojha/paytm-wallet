import express from 'express'
import { router as userRouter } from './user'
import accountRouter from './accounts'


const router = express.Router()

router.use('/user', userRouter)
router.use('/account', accountRouter)


export default router