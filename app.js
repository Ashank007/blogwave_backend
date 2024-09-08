import express from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import cors from "cors";
import userrouter from "./routes/user.routes.js";
import connectDb from "./config/database.js";
import blogrouter from "./routes/blog.routes.js";
dotenv.config();
const app = express();
connectDb();
app.use(cors({
    origin:[process.env.FRONTEND_URL,"http://localhost:3000"],
    credentials:true,
    methods:["GET","DELETE","POST","PUT"]
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1/user",userrouter);
app.use("/api/v1/blog",blogrouter);

export default app;
