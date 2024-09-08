import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import User from "../models/user.models.js";
import generateToken from "../utils/Tokengeneration.js";
import emailsent from "../middlewares/emailsender.js"
import otpgenerator from "otp-generator";
import bcrypt from "bcrypt"
const registerOtp = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json(new ApiResponse(false, "Email and Password are Required"));
        }
        const user = await User.findOne({
            email: email
        })
        if (user) {
            return res.status(400).json(new ApiResponse(false, "User Already Exists"));
        }
        const OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        const hasedpassword = await bcrypt.hash(password, 10);
        const newuser = await User.create({
            email: email,
            password: hasedpassword,
        })
        newuser.otp = OTP;
        await newuser.save();
        emailsent(email, "OTP VERIFICATION", `Here is your ${OTP} for verification`);
        res.status(200).json(new ApiResponse(true,{otp:OTP}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const registerverifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json(new ApiResponse(false, "Otp is Required"));
        }
        const user = await User.findOne({
            otp: otp
        })
        if (!user) {
            return res.status(400).json(new ApiResponse(false, "Invalid Otp"));
        }
        await user.updateOne({ $unset: { otp: "" } });
        user.isverifed = true;
        await user.save();
        res.status(201).json(new ApiResponse(true, "User Registered Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const sendotp = async(req,res)=>{
    try {
        const{email} = req.body;
        const user = await User.findOne({
            email:email
        })
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        user.otp = OTP;
        await user.save();
        emailsent(email, "OTP VERIFICATION",`Here is your ${OTP} for verification`);
        res.status(200).json(new ApiResponse(true,` Otp Sent To ${email}`));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const loginuserpassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json(new ApiResponse(false, "Email and Password are Required"));
        }
        const user = await User.findOne({
            email: email
        });
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        if(!user.isverifed){
            return res.status(400).json(new ApiResponse(false, "User Not Verified"));
        }
        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (!isAuthenticated) {
            return res.status(400).json(new ApiResponse(false, "Invalid Password"));
        }
        const token = generateToken({ _id: user._id, email: user.email }, process.env.JWT_SECRET)
        res.cookie("token", token, {
            maxAge: 48 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'None',
        })
        res.status(200).json(new ApiResponse(true, {token:token}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const loginotp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json(new ApiResponse(false, "Email is Required"));
        }
        const user = await User.findOne({
            email: email
        })
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        user.otp = OTP;
        await user.save();
        emailsent(email, "OTP VERIFICATION", `Here is your ${OTP} for verification`);
        res.status(200).json(new ApiResponse(true, {otp:OTP}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const loginverifyotp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json(new ApiResponse(false, "Otp is required"));
        }
        const user = await User.findOne({
            otp: otp
        });
        if (!user) {
            return res.status(400).json(new ApiResponse(false, "Invalid Otp"));
        }
        const token = generateToken({ _id: user._id, email: user.email }, process.env.JWT_SECRET)
        res.cookie("token", token, {
            maxAge: 48 * 60 * 60 * 1000,
            secure:  true,
           sameSite: 'None',
        })
        await user.updateOne({ $unset: { otp: "" } });
        user.save();
        res.status(200).json(new ApiResponse(true, {token:token}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const logoutuser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        res.cookie("token", "");
        res.status(200).json(new ApiResponse(true, "User Logged Out Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const deletemyprofile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("followers following");
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const userid = user._id.toString()
        //Followers
        for (let i = 0; i < user.followers.length; i++) {
            const followuser = user.followers[i];
            if (followuser.following.includes(userid)) {
                const index = followuser.following.indexOf(userid);
                followuser.following.splice(index, 1);
                await followuser.save();
            }
        }
        //Following
        for (let i = 0; i < user.following.length; i++) {
            const followuser = user.following[i];
            if (followuser.followers.includes(userid)) {
                const index = followuser.followers.indexOf(userid);
                followuser.followers.splice(index, 1);
                await followuser.save();
            }
        }
        await User.deleteOne({
            _id: user._id
        })
        res.status(200).json(new ApiResponse(true, "Profile Deleted Successfully"));
    } catch (error) {

    }
}
const forgotpassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({
            email: email
        })
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const OTP = otpgenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        user.otp = OTP;
        await user.save();
        emailsent(user.email, "OTP VERIFICATION", `Here is your ${OTP} for verification`);
        res.status(200).json(new ApiResponse(true, `Otp Sent To ${user.email}`));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const forgotpasswordotpverify = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json(new ApiResponse(false, "Otp is required"));
        }
        const user = await User.findOne({
            otp: otp
        })
        if (!user) {
            return res.status(400).json(new ApiResponse(false, "Invalid Otp"));
        }
        await user.updateOne({ $unset: { otp: "" } });
        res.status(200).json(new ApiResponse(true, "Otp Verified Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const forgotpasswordandchange = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);
        const isAuthenticated = await bcrypt.compare(password, user.password);
        if (isAuthenticated) {
            return res.status(400).json(new ApiResponse(true, "Previous Password and New Password Cant be Same"));
        }
        const hasedpassword = await bcrypt.hash(password, 10);
        user.password = hasedpassword;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Password Changed Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message))
    }
}
const addcontactdetails = async (req, res) => {
    try {
        const { details } = req.body;
        if (!details) {
            return res.status(400).json(new ApiResponse(true, "Details are Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(true, "User not Found"));
        }
        user.contact = details;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Contact Details Added Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const adddescription = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json(new ApiResponse(true, "Description is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(true, "User Not Found"));
        }
        user.description = description;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Description Added Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const addJobTitle = async (req, res) => {
    try {
        const { jobTitle } = req.body;
        if (!jobTitle) {
            return res.status(400).json(new ApiResponse(true, "JobTitle is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(true, "User Not Found"));
        }
        user.jobTitle = jobTitle;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Jobtitle Added Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const addlocation = async (req, res) => {
    try {
        const { location } = req.body;
        if (!location) {
            return res.status(400).json(new ApiResponse(true, "Location is Required"));
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(true, "User Not Found"));
        }
        user.location = location;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Location Added Successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const followuser = async (req, res) => {
    try {
        const { id,check } = req.body;
        if (!id) {
            return res.status(400).json(new ApiResponse(false, "Id is Required"));
        }
        const otheruser = await User.findById(id);
        if (!otheruser) {
            return res.status(404).json(new ApiResponse(false, "Invalid User Id"));
        }
        const otheruserid = otheruser._id.toString();
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(true, "User Not Found"));
        }
        const userid = user._id.toString();
        if (otheruser.followers.includes(userid)) {
            if(check){
                return res.status(200).json(new ApiResponse(true,{follow:true}));
            }
            const index = otheruser.followers.indexOf(userid);
            const index2 = user.following.indexOf(otheruserid);
            user.following.splice(index2, 1);
            otheruser.followers.splice(index, 1);
            otheruser.save();
            user.save();
            return res.status(200).json(new ApiResponse(true,{follow:false}));
        }
        if(check){
            return res.status(200).json(new ApiResponse(true,{follow:false}));
        }
        user.following.push(otheruserid);
        otheruser.followers.push(userid);
        await user.save();
        await otheruser.save();
        res.status(200).json(new ApiResponse(true, {follow:true}));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const profiledetails = async (req, res) => {
    try {
        const {email, url, username, interests } = req.body;
        if (!url || !username || !interests) {
            return res.status(400).json(new ApiResponse(false, "Url,Username and Interest are required"));
        }
        const user = await User.findOne({email:email});
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const usernameuser = await User.findOne({username:username});
        if(usernameuser) {
            return res.status(400).json(new ApiResponse(false, "Username already exists"));
        }
        for (let i = 0; i < interests.length; i++) {
            user.interests.push(interests[i]);
        }
        user.username = username;
        user.profilepic = url;
        await user.save();
        res.status(200).json(new ApiResponse(true, "Information Updated Succesfully"));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getuserdetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -otp -isverifed -createdAt").populate("ownblogs recentview");
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const data = user;
        res.status(200).json(new ApiResponse(true,data));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}
const getuserbyname = async (req, res) => {
    try {
        const {username}= req.body;
        const user = await User.find({username:username}).select("-password -otp -isverifed -createdAt -email -blogsaved -draftblogs -interests -uninterests -notifications").populate('ownblogs');
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        const data = user[0];
        res.status(200).json(new ApiResponse(true,data));
    } catch (error) {
        res.status(500).json(new ApiError(false, error.message));
    }
}

export { registerOtp, registerverifyOtp, sendotp, loginuserpassword, loginverifyotp, loginotp, logoutuser, deletemyprofile, forgotpassword, forgotpasswordotpverify, forgotpasswordandchange, getuserdetails, addcontactdetails, adddescription, addJobTitle,addlocation, followuser, profiledetails, getuserbyname };
