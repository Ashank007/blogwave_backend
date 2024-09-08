import mongoose from "mongoose";

const connectDb = ((req,res)=>{
    mongoose.connect(process.env.MONGODB_URI,{
        dbName:"Blog"
    })
    .then(()=>console.log("DataBase Connected"))
    .catch((e)=>console.log(e));
})
export default connectDb;