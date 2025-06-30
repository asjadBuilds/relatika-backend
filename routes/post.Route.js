import express from 'express';
import { addComment, addVoteOnPost, createPost, getCommentsByPost, getPaginatedPosts } from '../controllers/postControllers.js';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.post("/new", [
    query("title").notEmpty().withMessage("Title is required"),
    query("content").notEmpty().withMessage("Content is required"),
    query("spaceId").notEmpty().withMessage("Space ID is required"),
],
    upload.fields([{ name: 'gallery', maxCount: 20 }]),
    verifyJWT
    , createPost)

route.get("/posts", verifyJWT, getPaginatedPosts)

route.post("/addVote/:postId", [
    query('value').notEmpty().withMessage('Value is required')
], verifyJWT, addVoteOnPost)

route.post("/getCommentsByPost/:postId", verifyJWT, getCommentsByPost)

route.post("/addComment",
    [
        query('content').notEmpty().withMessage('content is required'),
        query('postId').notEmpty().withMessage('postId is required'),
    ],
    verifyJWT,
    addComment)

export default route;