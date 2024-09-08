import express from "express"
import { registerOtp, registerverifyOtp, sendotp, loginuserpassword, logoutuser, loginotp, loginverifyotp, deletemyprofile, forgotpassword, forgotpasswordotpverify, forgotpasswordandchange, getuserdetails, addcontactdetails, adddescription, followuser,profiledetails, getuserbyname, addJobTitle, addlocation } from "../controllers/user.controller.js";
import { addinterest, deleteinterest, adduninterest, deleteuninterest, getCreatedBlogs, getDraftBlogs,getSavedBlogs, createDraft,editDraft, GetIndividualDraft, DeleteDraft, searchbytitle, searchbytags } from "../controllers/user.blog.controllers.js";
import isAuthenticated from "../middlewares/isauthenticated.js"
const userrouter = express.Router();
userrouter.post("/registerotp", registerOtp)
userrouter.post("/registerverifyotp", registerverifyOtp);
userrouter.post("/loginpassword", loginuserpassword);
userrouter.post("/loginotp", loginotp);
userrouter.post("/loginverifyotp", loginverifyotp);
userrouter.post("/resendotp", sendotp);
userrouter.post("/profile",profiledetails);
userrouter.get("/forgotpassword", forgotpassword);
userrouter.post("/forgotpasswordverifyotp", forgotpasswordotpverify);
userrouter.post("/forgotpasswordchange",isAuthenticated, forgotpasswordandchange);
userrouter.get("/getuserdetails",isAuthenticated,getuserdetails);
userrouter.post("/addcontactdetails", isAuthenticated, addcontactdetails);
userrouter.post("/adddescription", isAuthenticated, adddescription);
userrouter.post("/addlocation", isAuthenticated, addlocation);
userrouter.get("/logout", isAuthenticated, logoutuser);
userrouter.delete("/deletmyprofile", isAuthenticated, deletemyprofile);
userrouter.post("/follow",isAuthenticated,followuser);
userrouter.post("/addinterest", isAuthenticated, addinterest);
userrouter.delete("/deleteinterest", isAuthenticated, deleteinterest);
userrouter.post("/adduninterest", isAuthenticated, adduninterest);
userrouter.delete("/deleteuninterest", isAuthenticated, deleteuninterest);
userrouter.get("/createdblogs",isAuthenticated,getCreatedBlogs);
userrouter.get("/draftblogs",isAuthenticated,getDraftBlogs);
userrouter.get("/savedblogs",isAuthenticated,getSavedBlogs);
userrouter.post("/getuser",isAuthenticated,getuserbyname);
userrouter.post("/addjobtitle",isAuthenticated,addJobTitle);
userrouter.post("/createDraft",isAuthenticated,createDraft);
userrouter.put("/editblog",isAuthenticated,editDraft);
userrouter.post("/getdraft",isAuthenticated,GetIndividualDraft);
userrouter.delete("/deletedraft/:title",isAuthenticated,DeleteDraft);
userrouter.get("/:title",isAuthenticated,searchbytitle)
userrouter.post("/tags",isAuthenticated,searchbytags);
export default userrouter;