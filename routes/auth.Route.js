import express from 'express';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createUser, forgetPassword, logout, refreshAccessToken, signIn } from '../controllers/authControllers.js';
const route = express.Router();

route.post("/signUp",[
    query("username").notEmpty(),
    query("email").isEmail(),
    query("password").isLength({min:8}),
],upload.single('avatar')
,createUser);

route.post("/signIn",[
    query("email").notEmpty(),
    query("password").isLength({min:8})
],signIn);

route.post("/logoutUser", verifyJWT, logout);

route.post("/refreshToken",  refreshAccessToken);

route.post("/sendOtp", query("email").isEmail(), forgetPassword);


export default route;