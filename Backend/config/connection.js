import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from both .env and config.env
dotenv.config();
dotenv.config({ path: "./config/config.env" });

const connection = async () => {
    try {
        // Check if MONGO_URL is defined
        if (!process.env.MONGO_URL) {
            console.error("MONGO_URL is not defined in environment variables");
            console.error("Available environment variables:", Object.keys(process.env).filter(key => !key.includes('SECRET')));
            throw new Error("MONGO_URL is not defined");
        }

        console.log("Connecting to MongoDB at:", process.env.MONGO_URL);
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        // Don't exit the process, but log the error
        console.error("Application will continue, but database operations will fail");
    }
}

export default connection;
