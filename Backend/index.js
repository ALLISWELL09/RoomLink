import express from 'express';
import cors from 'cors';
import connectionDB from "./config/connection.js";
import dotenv from 'dotenv';
import userRoutes from "./routes/userRoutes.js";
import fileUpload from 'express-fileupload';
import razorpay from 'razorpay';
import { v2 as cloudinary } from 'cloudinary';
import roomRoutes from "./routes/roomRoutes.js"
import ownerRouter from "./routes/ownerRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"


dotenv.config({path:"./config/config.env"});


const app = express();
const PORT = process.env.PORT || 3000;

//Connection
connectionDB();

//Middleware
app.use(express.json());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
// CORS configuration for development
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Specify exact origins
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Log CORS configuration
console.log("CORS configuration:", {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
});



//Cloudinary Configuration code
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




//Routes
app.use("/api/user",userRoutes);
app.use("/api/room",roomRoutes);
app.use("/api/owner",ownerRouter);
app.use("/api/admin",adminRouter);
app.use("/api/payment",paymentRoutes);

app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
})

