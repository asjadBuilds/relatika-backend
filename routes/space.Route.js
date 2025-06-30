import express from 'express';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createSpace, getSpaceById, getSpaces, getUserSpaces, joinSpace } from '../controllers/spaceControllers.js';

const route = express.Router();

route.post("/createSpace", [
    query("name").notEmpty(),
    query("description").notEmpty(),
    query("tagline").notEmpty(),
    upload.single("avatar"),
    verifyJWT,
    createSpace
])

route.get("/getSpaces", getSpaces)

route.post("/joinSpace",
    query("spaceId").notEmpty(),
    verifyJWT,
    joinSpace)

route.post("/getUserSpaces", verifyJWT, getUserSpaces)

route.post("/getSpaceById", verifyJWT, getSpaceById)

export default route;