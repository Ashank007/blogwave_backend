import jwt from "jsonwebtoken";

const generateToken = (payload,secret)=>{
    const token = jwt.sign(payload,secret,{
        expiresIn: "48h",
    })
    return token;
}

export default generateToken;