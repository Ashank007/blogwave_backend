import jwt from "jsonwebtoken"
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
const isAuthenticated = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json(new ApiResponse(false, "Please Login First"));
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(400).json(new ApiResponse(false, "Invalid Token"));
        }
        const user = await User.findById(decode._id);
        if (!user) {
            return res.status(404).json(new ApiResponse(false, "User Not Found"));
        }
        req.user = user;
        next();   
    } catch (error) {
        res.status(500).json(new ApiResponse(false,error.message));
    }
}
export default isAuthenticated;