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
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use("/api/v1/user",userrouter);
app.use("/api/v1/blog",blogrouter);

export default app;
