


// const User = require("../models/User");

const express = require("express");
const router = express.Router();    

const {sendOTP,signUp,login} = require("../controllers/Auth");

router.post("/sendOtp",sendOTP);
router.post("/signup",signUp);
router.post("/login",login);

module.exports = router;