
const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;

const userRoutes = require("./routes/UserRoutes");

const database = require("./config/database");
database.connect();

const cors = require("cors");
app.use(
    cors({
        origin:'*',
        credentials: true
    })
);


app.use(express.json());

// mounting the API Routes
app.use('/api/v1/auth',userRoutes);

app.get('/', (req, res) => {    
    return res.json({
        success:true,
        message:'Server is up and running successfully'
    });  
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

