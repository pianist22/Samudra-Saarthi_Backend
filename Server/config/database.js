const mongoose = require("mongoose");

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Database connection is successful");
    }).catch((err) => {
        console.log("Database connection failed");
        console.log(err);
    })
}