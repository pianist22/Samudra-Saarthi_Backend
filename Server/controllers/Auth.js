

const User = require("../models/User"); 
const OTP = require("../models/OTP");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config(); 


// send OTP handler
exports.sendOTP = async(req,res)=>{
    try{
        // fetch email from request ki body
        const {email} = req.body;

        // check whether the user already exists or not 
        const checkedUser = await User.findOne({email});
    
        // if user already exists then return response
        if(checkedUser){
            return res.status(401).json({
                success:false,
                message:`User already Registered`,
            });
        }
    
        // now generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP Generated:",otp);

        // check unique OTP or not
        let result = await OTP.findOne({otp:otp});

        // This loop will work until we generate unique OTP
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp}); 
        }

        // Now we have to create entry in the database 
        const otpPayload = {email,otp};

        // create an entry
        const otpBody =await OTP.create(otpPayload);
        if(otpBody){
            console.log(otpBody);
            console.log("Otp has been succesfully created in OTP database");
        }

        // return a successful response
        return res.status(200).json({
            success:true,
            message:`OTP Sent Successfully`,
            otp,
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}

// signup handler
exports.signUp = async(req,res) =>{
    try{
        // data fetch from req. body
        const {
            name,
            email,
            password,
            confirmPassword,
            otp
        } = req.body;
        // validate karo 
        if(!name || !email || !confirmPassword || !password || !otp){
            return res.status(403).json({
                success:false,
                message:`All fields are Required.`,
            });
        }

        // 2 passwords match karo
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:`Password and confirm Password value do not match, Please try again.`,
            });
        }
        // check if the user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:`User already registered`,
            });
        }
        // find the most recent otp stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1); 
        console.log("Otp fetched successfully from the database")
        console.log(recentOtp);

        // console.log("OTP",otp);
        // console.log("Database Otp",recentOtp.otp);

        // validate the otp
        if(recentOtp.length === 0){
            console.log("error");
            return res.status(400).json({
                success:false,
                message:`OTP not found`,
            });
            
        }
        else if (otp !== recentOtp[0].otp){
            console.log("Otp didn't match");
            return res.status(400).json({
                success:false,
                message:`Invalid OTP`,
            });
        }

        // password ko hash karo 
        const hashedPassword = await bcrypt.hash(password,10);
        

        // database me entry create karo 
        st = name.split(" ");
        firstname = st[0];
        lastname = st[1];

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname}${lastname}`
        });
        // response return karo
        return res.status(200).json({
            success:true,
            message:`User registered Successfully.`,
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:`User cannot be registered . Please try again`,
            error:error
        });
    }
}

// login handler
exports.login = async(req,res)=>{
    try{
        // data fetch from req.body
        const {email,password} = req.body;

        // validation of data
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:`All fields are required, Please try again`,
            });
        }
        
        // check whether there exist a user with the given email or not otherwise please tell them to signup first then they can login
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                success:false,
                message:`User is not registered, Please signup first`,
            });
        }

        // generate JWT , after password matching so user do not have to login again and again 
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h",
            });
            user.token = token;
            user.password = undefined;
            // create cookie and send it in response to user so whenever a user req. the login page cookie comes with it 
            const options = {
                expiresIn: new Date(Date.now() + 3*24*60*60*1000),
                httpsOnly: true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:`User Logged in successfully`,
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:`Password is incorrect.`,
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:`Login failed, Please try again later`,
        });
    }
}
