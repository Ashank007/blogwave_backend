import User from "../models/user.models.js";
import Blog from "../models/blog.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
function getRandomInt(min,max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max-min+1))+min;
}
let userliked;
const createblog = async (req, res) => {
    try {
        const { title, para,tags,coverpic } = req.body;
        if (!title || !para || !tags) {
            return res.status(404).json(new ApiResponse(false, "Tags,Title and Para are Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const blog = await Blog.findOne({
            title: title
        })
        if (blog) {
            if (blog.owner !== "") {
                return res.status(400).json(new ApiResponse(false, "Blog Created Already"));
            }
        }
        const newblog = await Blog.create({
            title: title,
            para: para,
            tags:tags,
            coverpic:coverpic,
        });
        const blogid = newblog._id.toString();
        const userid = user._id.toString();
        user.ownblogs.push(blogid);
        newblog.owner = userid;
        newblog.views.push(userid);
        await user.save();
        await newblog.save();
        res.status(201).json(new ApiResponse(true, "Blog Created Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const deleteblog = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = user._id.toString()
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }
        const blogowner = blog.owner.toString();
        if (blogowner !== userid) {
            return res.status(400).json(new ApiResponse(false, "You are not Owner of this Blog"));
        }
        for (let i = 0; i < user.ownblogs.length; i++) {
            if (user.ownblogs[i].toString() === id) {
                user.ownblogs.splice(i, 1);
                await user.save();
            }
        }
        await Blog.deleteOne({
            _id: blog._id
        })
        res.status(200).json(new ApiResponse(true, "Blog Deleted Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getblog = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const blog = await Blog.findById(id).populate('owner comments');
        if (!blog) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }
        let flag = 0;
        for (let i = 0; i < blog.views.length; i++) {
            if (blog.views[i].toString() !== user._id.toString()) {
                flag = 1;
                
            }
            else{
                flag = 0;
            }
        }

        if(flag){
            blog.views.push(user._id.toString());
            user.recentview.unshift(blog);
            await user.save();
            await blog.save();
        }
        const commentuserinfo = [];
        for(let i=0;i<blog.comments.length;i++){
            let commentuser = blog.comments[i].owner.toString();
            let userinfo = await User.findById(commentuser).select("username profilepic")

            commentuserinfo.push({owner:userinfo,comment:blog.comments[i].title});
        }
        const userid = req.user._id.toString();
        if (blog.likes.includes(userid)) {
            userliked=true;
        }else{
            userliked=false;
        }
        const response = {
            title:blog.title,
            para:blog.para,
            views:blog.views.length,
            owner:blog.owner,
            likes:blog.likes.length,
            comments:commentuserinfo,
            tags:blog.tags,
            liked:userliked
        }
        res.status(200).json(new ApiResponse(true, response));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const likeblog = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = user._id.toString();
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }
        if (blog.likes.includes(userid)) {
            const index = blog.likes.indexOf(userid);
            blog.likes.splice(index, 1);
            await blog.save();
            userliked=false;
            return res.status(200).json(new ApiResponse(true, "Blog Post Unliked"));
        }
        userliked=true;
        blog.likes.push(user._id.toString());
        await blog.save();
        res.status(200).json(new ApiResponse(true, "Blog Post Liked"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const commentblog = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const user = await User.findById(req.user._id);
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        if (!comment) {
            return res.status(400).json(new ApiResponse(false, "Comment is Required"));
        }
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = user._id.toString();
        const blog = await Blog.findById(id).populate("comments");
        if (!blog) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }
        const newcomment = {
            owner: req.user._id,
            title: comment
        }
        blog.comments.push(newcomment);
        await blog.save();
        res.status(200).json(new ApiResponse(true, "Comment Added to Blog"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getbloginfo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }
        const user = await User.findById(req.user._id);
        if(!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = req.user._id.toString();
        if (blog.likes.includes(userid)) {
            userliked = true;
        }
        else{
            userliked = false;
        }
        res.status(200).json(new ApiResponse(true, {blog:blog,liked:userliked}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const tagblog = async(req,res)=>{
    try {
        const{tags,pagesno} = req.body;
        if(!tags){
            return res.status(404).json(new ApiResponse(false, "Tags are Needed")); 
        }
        const limit = 5;
        const pageno = pagesno||0;
        const skipno = limit*pageno;
        const blogs = await Blog.find({
            $or: tags.map(tag => ({ tags: tag }))
         }).limit(limit).skip(skipno);
         if(!blogs){
            return res.status(404).json(new ApiResponse(false, "No Blog with that tags"));
         }
        const blogdata = [];
        const userid = req.user._id.toString();
        for(let i=0;i<blogs.length;i++)
        {
            let read;
            if(blogs[i].views.includes(userid)){
                read=true;
            }
            else{
                read=false;
            }
            let liked;
            if(blogs[i].likes.includes(userid)){
                liked=true;
            }else{
                liked=false;
            }
            const user = await User.findById(blogs[i].owner);
            const data = {
                title:blogs[i].title,
                views:blogs[i].views.length,
                read:read,
                liked:liked,
                likes:blogs[i].likes.length,
                tags:blogs[i].tags,
                comments:blogs[i].comments.length,
                owner:user,
                coverpic:blogs[i].coverpic,
                _id:blogs[i]._id.toString(),
                createdAt:blogs[i].createdAt,
            }
            blogdata.push(data);
        } 
        res.status(200).json(new ApiResponse(true, blogdata));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }  
}
const saveBlog = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const {id,save} = req.body;
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        if(save){
            if(user.blogsaved.includes(id)){
                const index = user.blogsaved.indexOf(id);
                user.blogsaved.splice(index, 1);
                await user.save();
                return res.status(200).json(new ApiResponse(true, {saved:false}));
            }
            user.blogsaved.push(id);
            await user.save();
            return res.status(200).json(new ApiResponse(true, {saved:true}));
        }    
        if(user.blogsaved.includes(id)){
            return res.status(200).json(new ApiResponse(true,{saved:true}));
        }   
        res.status(200).json(new ApiResponse(true, {saved:false}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const sampleblog = async (req, res) => {
    try {

          const topBlogs = await Blog.find({}).populate("owner");
          const num1 = getRandomInt(0,topBlogs.length-3);
          const topBlog = []
          const nums =[num1,num1+1,num1+2];
          nums.forEach(i => {
            const data = {
                coverpic: topBlogs[i].coverpic,
                owner: topBlogs[i].owner.username,
                profilepic: topBlogs[i].owner.profilepic,
                title: topBlogs[i].title,
                _id: topBlogs[i]._id,
                likes: topBlogs[i].likes.length,
                comments: topBlogs[i].comments.length,
                views: topBlogs[i].views.length,
            }
            topBlog.push(data);
          });
          res.status(200).json(new ApiResponse(true,topBlog));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getunauthBlog = async (req, res) => {
    try {
        const {id} = req.params;
        const blogs = await Blog.findById(id).populate("owner");
        if (!blogs) {
            return res.status(404).json(new ApiResponse(false, "Blog Not Found"));
        }

        const blog = {
            title: blogs.title,
            para: blogs.para,
            _id: blogs._id.toString(),
            comments: blogs.comments,
            likes: blogs.likes.length,
            tags: blogs.tags,
            views: blogs.views.length,
            liked: false,
            saved: false,
            owner: {
                description: blogs.owner.description,
                followers: blogs.owner.followers,
                profilepic: blogs.owner.profilepic,
                username: blogs.owner.username,
            },
            coverpic: blogs.coverpic,
        }
        res.status(200).json(new ApiResponse(true, blog));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
export { createblog, deleteblog, getblog, likeblog, commentblog, getbloginfo, tagblog, saveBlog, sampleblog, getunauthBlog};