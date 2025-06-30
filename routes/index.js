import express from 'express';
const router = express.Router();
import userRouter from './auth.Route.js'
import spaceRouter from './space.Route.js';
import postRouter from './post.Route.js';

router.use('/auth',userRouter)
router.use('/space',spaceRouter)
router.use('/post',postRouter)

export default router;