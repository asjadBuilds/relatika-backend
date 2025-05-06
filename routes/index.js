import express from 'express';
const router = express.Router();
import userRouter from './auth.Route.js'

router.use('/auth',userRouter)

export default router;