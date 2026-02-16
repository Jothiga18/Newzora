const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({entended:true}));
app.use(cors({
    origin : "http://localhost:3000",
    credentials : true ,
}));

// app.use("api/auth",require("./routes/authRoutes"));

app.get("/",(req,res)=>{
    res.send("Newzora api running");
});

const PORT = process.env.PORT || 5000 ;

app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`);
});