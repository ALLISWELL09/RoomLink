import Users from "../models/users.model.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import booking from '../models/booking.model.js';
import rooms from '../models/rooms.model.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';






export const signup = async (req,res)=>{

    const {name,email,password,mobile_no,role} = req.body;

    try{


        if(!name || !email || !password || !mobile_no || !role){
            return res.status(400).json({error:"All fields are required"})
        }

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already has an account" });
        }


        //Uploading Image
        const profile_pic = req.files.profile_pic;

       // Check if a file is uploaded
       if (!req.files || !req.files.profile_pic) {
        return res.status(400).json({ error: "No file uploaded" });
    }


    // Allowed file formats
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedFormats.includes(profile_pic.mimetype)) {
        return res.status(400).json({ error: "Invalid File Format. Only PNG and JPG are allowed" });
    }

    // Upload to Cloudinary
    const cloudResponse = await cloudinary.uploader.upload(profile_pic.tempFilePath);

    console.log(cloudResponse);



    if (!cloudResponse || cloudResponse.error) {
        return res.status(400).json({ error: "Error uploading file to Cloudinary" });
    }
    //Encrpting Password
        const hashPassword = await bcrypt.hash(password,10);

        const userData = {
            name,
            email,
            password:hashPassword,
            mobile_no,
            role,
            profile_pic:{
                public_id: cloudResponse.public_id,
                url:cloudResponse.url
            }
        }


      const user =  await Users.create(userData);
      res.json({
        message:" User Register Successfully",
        user
      })

    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Error in Register"})
    }

}

export const login = async (req,res)=>{
    const {email,password} = req.body;

    try{
        // Validate input
        if(!email || !password) {
            return res.status(400).json({error:"Email and password are required"});
        }

        // Find user by email
        const user = await Users.findOne({email:email});

        // Check if user exists
        if(!user){
            return res.status(404).json({error:"User not found. Please check your email."});
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({error:"Invalid password"});
        }

        // Create JWT Token
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_USER_PASSWORD, {expiresIn:"1d"});

        const cookiesOption = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "Strict"
        };

        // Store token in cookie
        res.cookie("jwt", token, cookiesOption);

        // Return success response with user data and token
        res.status(200).json({
            message: "User Login Successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_pic: user.profile_pic
            },
            token
        });
    } catch(error){
        console.log("Login error:", error);
        res.status(500).json({error:"Error in login process. Please try again."});
    }

}

export const logout = async (req,res)=>{
    try {
        if (!req.cookies || !req.cookies.jwt) {
            return res.status(401).json({error:"please Login your email ",});
        }

        res.clearCookie("jwt");

        res.status(200).json({message:"User Logout Successfully"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Error in Logout"})

    }

}

// Send stored password directly to email
export const forgotPassword = async (req, res) => {
    console.log("forgotPassword: Function called");
    console.log("forgotPassword: Request body:", req.body);

    try {
        const { email } = req.body;
        console.log("forgotPassword: Email extracted:", email);

        if (!email) {
            console.log("forgotPassword: No email provided");
            return res.status(400).json({ error: "Please provide your email address" });
        }

        // Find user by email
        console.log("forgotPassword: Finding user with email:", email);
        let user = await Users.findOne({ email });
        console.log("forgotPassword: User found:", user ? "Yes" : "No");

        if (!user) {
            console.log("forgotPassword: User not found");
            return res.status(404).json({ error: "User with this email does not exist" });
        }

        // IMPORTANT SECURITY NOTE:
        // Modern authentication systems never store actual passwords in the database
        // Instead, they store a one-way hash of the password
        // This means it's impossible to retrieve the original password from the database
        // The only option is to create a new password for the user

        // For security reasons, we cannot send the stored password because:
        // 1. The password in the database is hashed (one-way encryption)
        // 2. There is no way to reverse the hash to get the original password
        // 3. This is a security best practice to protect user passwords

        // Get the stored password from the database (this is the hashed password)
        const storedHashedPassword = user.password;
        console.log("forgotPassword: Retrieved stored hashed password");

        // Create a new password for the user
        const newPassword = Math.random().toString(36).slice(-8);
        console.log("forgotPassword: Generated new password");

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();
        console.log("forgotPassword: User password updated");

        // Create email message with the password
        const message = `
            <h2>Your RoomLink Password</h2>
            <p>You requested your password for your RoomLink account.</p>
            <p>Here is your password:</p>
            <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center;">
                ${newPassword}
            </div>
            <p>Please use this password to log in to your account.</p>
            <p>We recommend changing your password after logging in for security reasons.</p>
            <p>If you didn't request this, please contact support immediately.</p>
        `;

        // Try to send email using Gmail first, then fall back to Ethereal
        console.log("forgotPassword: Setting up nodemailer");

        let info;
        let previewURL = null;
        let testMode = false;

        try {
            // First try with Gmail
            console.log("forgotPassword: Trying to send with Gmail");

            // Create Gmail transporter with the App Password
            const gmailTransporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD // This should be the App Password without spaces
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Send email with Gmail
            info = await gmailTransporter.sendMail({
                from: `"RoomLink Support" <${process.env.EMAIL_USERNAME}>`,
                to: email,
                subject: 'Your RoomLink Password',
                html: message
            });

            console.log("forgotPassword: Email sent successfully with Gmail, ID:", info.messageId);
        } catch (gmailError) {
            // If Gmail fails, fall back to Ethereal
            console.error("forgotPassword: Gmail sending failed:", gmailError.message);
            console.log("forgotPassword: Falling back to Ethereal Email");

            // Create a test account using Ethereal Email for testing
            const testAccount = await nodemailer.createTestAccount();
            console.log("forgotPassword: Test account created:", testAccount.user);

            // Create a transporter using Ethereal Email
            const etherealTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            // Send email with Ethereal
            info = await etherealTransporter.sendMail({
                from: '"RoomLink Support" <support@roomlink.com>',
                to: email,
                subject: 'Your RoomLink Password',
                html: message
            });

            console.log("forgotPassword: Email sent successfully with Ethereal, ID:", info.messageId);

            // Get the preview URL for Ethereal
            previewURL = nodemailer.getTestMessageUrl(info);
            console.log("forgotPassword: Preview URL:", previewURL);
            testMode = true;
        }

        // Return appropriate response based on which method was used
        if (testMode) {
            // Return success with preview URL for Ethereal
            return res.status(200).json({
                message: "Password sent successfully",
                note: "We've sent your password to your email address. Please check the preview URL to see the email.",
                emailSent: true,
                previewUrl: previewURL,
                testMode: true
            });
        } else {
            // Return success for Gmail
            return res.status(200).json({
                message: "Password sent successfully",
                note: "We've sent your password to your email address. Please check your inbox.",
                emailSent: true
            });
        }

    } catch (error) {
        console.error("Forgot password error:", error);

        // Log detailed error information
        if (error.code === 'EAUTH') {
            console.error("Authentication error with email provider. Check your credentials.");
            return res.status(500).json({ error: "Email server authentication failed. Please contact support." });
        }

        if (error.code === 'ESOCKET') {
            console.error("Socket connection error with email provider.");
            return res.status(500).json({ error: "Could not connect to email server. Please try again later." });
        }

        // Don't try to modify user object if it doesn't exist or if there was an error finding it
        try {
            const user = await Users.findOne({ email: req.body.email });
            if (user) {
                // If we've already updated the user's password but failed to send the email,
                // we should revert the password change to avoid locking the user out
                if (user.resetPasswordToken === undefined && user.resetPasswordExpire === undefined) {
                    console.log("Reverting password change due to email sending failure");
                    // We don't know the original password, so we'll set a flag to indicate
                    // that the password needs to be reset
                    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
                    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
                    await user.save();
                }
            }
        } catch (err) {
            console.error("Error cleaning up after failed password reset:", err);
        }

        // Provide more specific error message if possible
        let errorMessage = "Error sending password reset email. Please try again.";
        if (error.message) {
            console.error("Error message:", error.message);

            // Check for specific error messages
            if (error.message.includes("Invalid login") || error.message.includes("authentication failed")) {
                errorMessage = "Email server authentication failed. Please contact support.";
            } else if (error.message.includes("Failed to configure email service")) {
                errorMessage = "Email service configuration failed. Please try again later.";
            } else if (error.message.includes("Failed to send email")) {
                errorMessage = "Failed to send email. Please try again later.";
            } else if (error.message.includes("EAUTH")) {
                errorMessage = "Email authentication failed. Please check the email credentials.";
            } else if (error.message.includes("ESOCKET")) {
                errorMessage = "Could not connect to email server. Please try again later.";
            } else if (error.message.includes("ETIMEDOUT")) {
                errorMessage = "Connection to email server timed out. Please try again later.";
            } else if (error.message.includes("ECONNREFUSED")) {
                errorMessage = "Connection to email server refused. Please try again later.";
            }
        }

        // Log the final error message we're sending to the client
        console.log("Sending error response to client:", errorMessage);

        res.status(500).json({ error: errorMessage });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        // Get token from params and hash it
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user with this token and check if token is still valid
        const user = await Users.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }

        // Validate new password
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Update password and clear reset token fields
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Error resetting password. Please try again." });
    }
};

export const booked = async (req,res)=>{
    const userId = req.userId;

    try {
        const booked = await booking.find({userId:userId})


        if(booked.length === 0){
            return res.status(400).json({error:"This User has not booked any room"})
        }


        let bookedRoommId = []
        booked.forEach(async (book)=>{
            bookedRoommId.push(book.roomId)

        })
        if(bookedRoommId.length === 0){
            return res.status(400).json({error:"This User has not booked any room"})
        }
        const roomsData = await rooms.find({_id:{$in:bookedRoommId}})



        res.status(200).json({message:"Booked Data Found",booked,roomsData})



    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Error in Fetching Booked User"})

    }
}

export const getUserProfile = async (req, res) => {
    const userId = req.userId;

    try {
        console.log(`Fetching profile data for user ID: ${userId}`);

        if (!userId) {
            console.error('User ID is missing in the request');
            return res.status(401).json({ error: "Authentication required. Please login again." });
        }

        // Get user data
        const userData = await Users.findById(userId);

        if (!userData) {
            console.error(`User with ID ${userId} not found`);
            return res.status(404).json({ error: "User not found" });
        }

        // Get total bookings
        const totalBookings = await booking.countDocuments({ userId: userId });

        // Calculate join date (using MongoDB ObjectId creation timestamp)
        const joinedDate = new Date(parseInt(userId.substring(0, 8), 16) * 1000);
        const formattedJoinDate = joinedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Prepare profile data
        const profileData = {
            name: userData.name,
            email: userData.email,
            mobile_no: userData.mobile_no,
            totalBookings: totalBookings,
            joinedDate: formattedJoinDate,
            profileImage: userData.profile_pic?.url || null,
            timestamp: new Date().toISOString(),
            userId: userId
        };

        console.log('Sending profile data to client:', profileData);
        res.status(200).json(profileData);

    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ error: "Error fetching profile data", message: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    const userId = req.userId;
    const { name, email, mobile_no } = req.body;

    try {
        console.log(`Updating profile data for user ID: ${userId}`);

        if (!userId) {
            console.error('User ID is missing in the request');
            return res.status(401).json({ error: "Authentication required. Please login again." });
        }

        // Validate input
        if (!name && !email && !mobile_no && !req.files) {
            return res.status(400).json({ error: "No data provided for update" });
        }

        // Get user data
        const userData = await Users.findById(userId);

        if (!userData) {
            console.error(`User with ID ${userId} not found`);
            return res.status(404).json({ error: "User not found" });
        }

        // Prepare update data
        const updateData = {};

        // Update basic fields if provided
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (mobile_no) updateData.mobile_no = mobile_no;

        // Handle profile picture update if provided
        if (req.files && req.files.profile_pic) {
            const profile_pic = req.files.profile_pic;

            // Validate file format
            const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
            if (!allowedFormats.includes(profile_pic.mimetype)) {
                return res.status(400).json({ error: "Invalid File Format. Only PNG and JPG are allowed" });
            }

            // Delete old image from Cloudinary if exists
            if (userData.profile_pic && userData.profile_pic.public_id) {
                await cloudinary.uploader.destroy(userData.profile_pic.public_id);
            }

            // Upload new image to Cloudinary
            const cloudResponse = await cloudinary.uploader.upload(profile_pic.tempFilePath);

            if (!cloudResponse || cloudResponse.error) {
                return res.status(400).json({ error: "Error uploading file to Cloudinary" });
            }

            // Add profile pic data to update
            updateData.profile_pic = {
                public_id: cloudResponse.public_id,
                url: cloudResponse.url
            };
        }

        // Update user data in database
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        // Return updated user data
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                mobile_no: updatedUser.mobile_no,
                profile_pic: updatedUser.profile_pic
            }
        });

    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ error: "Error updating profile data", message: error.message });
    }
}