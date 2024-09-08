import express from "express"
import isAuthenticated from "../middlewares/isauthenticated.js"
import { createblog, deleteblog, getblog, likeblog, commentblog, getbloginfo, tagblog, saveBlog, sampleblog, getunauthBlog } from "../controllers/blog.controller.js";
const blogrouter = express.Router();
blogrouter.get("/sampleblogs",sampleblog);
blogrouter.get("/sample/:id",getunauthBlog);
blogrouter.post("/create", isAuthenticated, createblog);
blogrouter.get("/:id", isAuthenticated, getblog);
blogrouter.get("/like/:id", isAuthenticated, likeblog);
blogrouter.post("/comment/:id", isAuthenticated, commentblog);
blogrouter.delete("/delete/:id", isAuthenticated, deleteblog);
blogrouter.post("/tags", isAuthenticated, tagblog);
blogrouter.post("/save", isAuthenticated,saveBlog);
export default blogrouter