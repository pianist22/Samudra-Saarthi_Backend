const jwt = require("jsonwebtoken");    
const User = require("../models/User"); 
require('dotenv').config();

// is Auth
exports.auth = async(req,res,next)=>{
    try{
        // extract Token
        console.log("authorization is taking place");
        console.log("error");
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");
        
        // check if token is missing or not 
        if(!token){
            console.log("Token is missing");
            return res.status(401).json({
                success:false,
                message:`Token is missing`,
            });
        }

        // Verify the token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);

            req.user = decode; 
        }
        catch(error){
            // verification me issue hain
            console.log(error);
            return res.status(401).json({
                success:false,
                message:`Token is invalid`,
            });
        }
        next(); // calling the next middleware after verifying the token 
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:`Something went wrong while verifying the token`,
        });
    }
};
