import express from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { getUserComments, getUserPosts } from '../controllers/userControllers.js';
const route = express.Router();

route.get("/getUserPosts",verifyJWT,getUserPosts);

route.get("/getUserComments",verifyJWT,getUserComments);

export default route;