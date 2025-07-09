import express from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { getUserComments, getUserPosts } from '../controllers/userControllers.js';
const route = express.Router();

route.post("/getUserPosts",verifyJWT,getUserPosts);

route.post("/getUserComments",verifyJWT,getUserComments);

export default route;