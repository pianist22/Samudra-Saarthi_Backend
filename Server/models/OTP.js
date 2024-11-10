
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 180
    }
});

// a function to send email 
async function sendVerficationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email from Samudra Saarthi",emailTemplate(otp));
        console.log("Email sent successfully",mailResponse.response);
    }
    catch(error){
        console.log("Error occured while sending mail",error);
        throw error;
    }
}

// pre middleware 
OTPSchema.pre("save",async function(next){
	console.log("New document saved to database");
    
    //Only send an email when a new document is created
    if(this.isNew){
        await sendVerficationEmail(this.email,this.otp);
    } 
    next();
});


module.exports = mongoose.model("OTP", OTPSchema);