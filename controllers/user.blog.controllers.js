import User from "../models/user.models.js";
import Blog from "../models/blog.models.js"
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"

const addinterest = async (req, res) => {
    try {
        const { interest } = req.body;
        if (!interest) {
            return res.status(400).json(new ApiResponse(false, "Interest is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        if (user.interests.includes(interest)) {
            return res.status(400).json(new ApiResponse(false, "Interest Already Added"));
        }
        user.interests.push(interest);
        await user.save();
        res.status(200).json(new ApiResponse(true, "Interest Added Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const deleteinterest = async (req, res) => {
    try {
        const { interest } = req.body;
        if (!interest) {
            return res.status(400).json(new ApiResponse(false, "Interest is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const include = user.interests.includes(interest)
        if (!include) {
            return res.status(400).json(new ApiResponse(false, "Interest Not Found"));
        }
        const index = user.interests.indexOf(interest);
        user.interests.splice(index, 1);
        await user.save();
        res.status(200).json(new ApiResponse(true, "Interest Deleted Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const adduninterest = async (req, res) => {
    try {
        const { uninterest } = req.body;
        if (!uninterest) {
            return res.status(400).json(new ApiResponse(false, "Uninterest is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        if (user.uninterests.includes(uninterest)) {
            return res.status(400).json(new ApiResponse(false, "Uninterest Already Added"));
        }
        user.uninterests.push(uninterest);
        await user.save();
        res.status(200).json(new ApiResponse(true, "Uninterest Added Successfully"));  
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const deleteuninterest = async (req, res) => {
    try {
        const { uninterest } = req.body;
        if (!uninterest) {
            return res.status(400).json(new ApiResponse(false, "Uninterest is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const include = user.uninterests.includes(uninterest)
        if (!include) {
            return res.status(400).json(new ApiResponse(false, "Uninterest Not Found"));
        }
        const index = user.uninterests.indexOf(uninterest);
        user.uninterests.splice(index, 1);
        await user.save();
        res.status(200).json(new ApiResponse(true, "Uninterest Deleted Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getCreatedBlogs = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = user.id;
        const blogs = await Blog.find({ owner: userid });
        res.status(200).json(new ApiResponse(true, {blogs: blogs}));
    }catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getSavedBlogs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("blogsaved");
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const savedBlogs = user.blogsaved;
        res.status(200).json(new ApiResponse(true, {savedBlogs: savedBlogs}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const createDraft = async (req, res) => {
    try {
        const {title,para,tags,coverpic} = req.body;
        if(!title||!para){
            return res.status(400).json(new ApiResponse(false,"Title and Para are Required"));
        }
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json(new ApiResponse(false,"User Not Found"));
        }
        const data = {
            title:title,
            para:para,
            owner:req.user._id,
            tags:tags,
            coverpic:coverpic,
        }
        user.draftblogs.push(data);
        await user.save();
        res.status(200).json(new ApiResponse(true,"Draft Blog is Saved"));
    } catch (error) {
        res.status(500).json(new ApiError(false,error.message));
    }
}
const getDraftBlogs = async (req, res) => {
  
        try {
            const user = await User.findById(req.user._id);
            if(!user){
                return res.status(404).json(new ApiResponse(false,"User Not Found"));
            }
            const draftblogs = [];
            for(let i=0;i<user.draftblogs.length;i++)
            {
                draftblogs.push(user.draftblogs[i]);
            }
            res.status(200).json(new ApiResponse(true,{draftBlogs:draftblogs}));
        } catch (error) {
            res.status(500).json(new ApiError(false,error.message));
        }
}
const editDraft= async (req, res) => {
        try {
            const {oldtitle,newtitle,para,tags,coverpic} = req.body;
            if(!oldtitle||!newtitle||!para)
            {
                return res.status(400).json(new ApiResponse(false,"OldTitle,NewTitle and Para are Rrequired"));
            }
            const user = await User.findById(req.user._id);
            if(!user){
                return res.status(404).json(new ApiResponse(false,"User Not Found"));
            }
            for(let i=0;i<user.draftblogs.length;i++)
            {
                if(user.draftblogs[i].title==oldtitle)
                {
                    const draftblog = user.draftblogs[i];
                    draftblog.title = newtitle;
                    draftblog.para  = para;
                    draftblog.tags = tags;
                    draftblog.coverpic = coverpic;
                }
                else
                {
                    return res.status(400).json(new ApiResponse(false,"Draft Blog Doesn't Exist"));
                }
            }
            await user.save();
            res.status(200).json(new ApiResponse(true,"Draft Blog Updated Succesfully"));
        } catch (error) {
            res.status(500).json(new ApiError(false,error.message));
        }
}
const GetIndividualDraft = async (req, res) => {
    try {
        let found = false;
        const {title} = req.body;
        if(!title)
        {
            return res.status(400).json(new ApiResponse(false,"Title is required"));
        }
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json(new ApiResponse(false,"User Not Found"));
        }
        let blog;
        for(let i=0;i<user.draftblogs.length;i++)
        {
            if(user.draftblogs[i].title==title)
            {
                blog = user.draftblogs[i];
                found = true;
            }
        }
        if(found){
            return res.status(200).json(new ApiResponse(true,{blog:blog}));
        }
        res.status(404).json(new ApiResponse(false,' Draft Blog Not Found'));
    } catch (error) {
        res.status(500).json(new ApiError(false,error.message));
    }
}
const DeleteDraft = async (req, res) => {
    try {
        const {title} = req.params;
        if(!title)
        {
            return res.status(400).json(new ApiResponse(false,"Title is required"));
        }
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json(new ApiResponse(false,"User Not Found"));
        }
        let found = false;
        for(let i=0;i<user.draftblogs.length;i++)
        {
            if(user.draftblogs[i].title==title)
            {
                found = true;
                user.draftblogs.splice(i,1);
                await user.save();
            }
        }
        if(found)
        {
            return res.status(200).json(new ApiResponse(true,"Draft Blog Deleted Successfully"));
        }
        res.status(400).json(new ApiResponse(false,"Draft Blog Not Found"));
    } catch (error) {
        res.status(500).json(new ApiError(false,error.message));
    }
}
const searchbytitle = async (req, res) => {
    try {
        
        const {title} = req.params;
        const blogs = await Blog.find({
            $text: { $search: title, $caseSensitive:false }
        });
        if(!blogs){
            return res.status(404).json(new ApiResponse(false,"No Blog found"));
        }
        const blog=[];
        for(let i=0;i<blogs.length;i++){
            const data ={
                _id: blogs[i]._id,
                title: blogs[i].title,
                author: blogs[i].author,
                coverpic: blogs[i].coverpic,
                createdAt: blogs[i].createdAt,
                updatedAt: blogs[i].updatedAt,
                views: blogs[i].views,
                likes: blogs[i].likes,
                dislikes: blogs[i].dislikes,
                comments: blogs[i].comments,
                user: req.user._id,
                createdAt: blogs[i].createdAt,
                updatedAt: blogs
            }
            blog.push(data);
        }
        res.status(200).json(new ApiResponse(true, {blogs: blog}));
    } catch (error) {
        res.status(500).json(new ApiError(false,error.message));
    }
}
const searchbytags = async (req, res) => {
    try {
        
        const {tags} = req.body;
        if(!tags){
            return res.status(400).json(new ApiResponse(false,"Tags are required"));
        }
        const blog=[];
        for(let j = 0; j < tags.length; j++) {
            let blogs = await Blog.find({tags: tags[j]});
            for(let i = 0; i < blogs.length; i++) {

                const data ={
                    _id: blogs[i]._id,
                    title: blogs[i].title,
                    author: blogs[i].author,
                    coverpic: blogs[i].coverpic,
                    createdAt: blogs[i].createdAt,
                    updatedAt: blogs[i].updatedAt,
                    views: blogs[i].views,
                    likes: blogs[i].likes,
                    dislikes: blogs[i].dislikes,
                    comments: blogs[i].comments,
                    user: req.user._id,
                    createdAt: blogs[i].createdAt,
                }
                blog.push(data);
            }
        }
        if(!blog){
            return res.status(404).json(new ApiResponse(false,"No Blog found"));
        } 
        const uniblog = blog.filter((obj, index, self) =>
            index === self.findIndex((t) => t.title === obj.title)
          );
        res.status(200).json(new ApiResponse(true, {blogs: uniblog}));
    } catch (error) {
        res.status(500).json(new ApiError(false,error.message));
    }
}
export { addinterest, deleteinterest,adduninterest,deleteuninterest, getCreatedBlogs, getSavedBlogs, getDraftBlogs, createDraft, editDraft,GetIndividualDraft, DeleteDraft,searchbytitle, searchbytags};
