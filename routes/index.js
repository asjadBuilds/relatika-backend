import express from 'express';
const router = express.Router();
import authRouter from './auth.Route.js'
import spaceRouter from './space.Route.js';
import postRouter from './post.Route.js';
import userRouter from './user.Route.js'
import chatRouter from './chat.Route.js'
router.use('/auth',authRouter)
router.use('/space',spaceRouter)
router.use('/post',postRouter)
router.use('/user',userRouter)
router.use('/chat',chatRouter)

export default router;