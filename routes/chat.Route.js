import express from 'express';
import { createOrGetConversation, getConversations, getMessagesByConversation, sendMessage } from '../controllers/chatControllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js'
const router = express.Router();

router.get('/getConversations',verifyJWT,getConversations);

router.post('/getSingleConversation',verifyJWT, createOrGetConversation)

router.get('/getMessages/:conversationId',verifyJWT,getMessagesByConversation);

router.post('/sendMessage',verifyJWT,sendMessage);

export default router