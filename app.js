import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import mongoDb from "./db/index.js";
import router from "./routes/index.js";
import sgMail from "@sendgrid/mail";
import { Server } from "socket.io";
import http from 'http'
import { socketManager } from "./socketManager.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
  },
});app.use((req,res,next)=>{
  req.io=io;
  next()
})
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
dotenv.config()

mongoDb();
socketManager(io)

server.listen(process.env.PORT, ()=>{
    console.log(`Server is running at ${process.env.PORT}`)
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use('/api',router)

export {app, sgMail}