import mongoose, { Schema } from "mongoose";

const blogSechma = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    para: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    views: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [
        {
        owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
        },
        title:{
            type:String,
            required:true
        }
    }],
    tags: [{
        type: String
    }],
    coverpic:{
        type: String,
        required:true
    },
}, { versionKey: false, timestamps: true });
blogSechma.index(
    {
        title:"text"
    }
)
const Blog = mongoose.model("Blog", blogSechma);
export default Blog;