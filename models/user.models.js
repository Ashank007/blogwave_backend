import mongoose, { Schema } from "mongoose";

const userSechma = new mongoose.Schema({
    username: {
        type: String, 
    },
    email:{
        type: String,
        required: true,
    },
    profilepic: {
        type: String
    },
    contact: {
        type: String
    },
    jobTitle:{
        type: String,
    },
    description: {
        type: String
    },
    location:{
        type: String,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    ownblogs: [{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }],
    blogsaved: [{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }],
    recentview: [{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }],
    draftblogs:[{
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
            tags: [{
                type: String
            }],
            coverpic:{
                type: String,
            },
        
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    interests:[],
    uninterests:[],
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    otp: {
        type: String,
        default: null
    },
    isverifed:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
}, { versionKey: false});

const User = mongoose.model("User", userSechma);
export default User;