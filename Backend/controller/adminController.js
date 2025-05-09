import admin from "../models/admin.model.js";
import User from "../models/users.model.js";
import Room from "../models/rooms.model.js";
import Booking from "../models/booking.model.js";
import Owner from "../models/owner.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import mongoose from "mongoose";



export const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log("Admin login attempt with email:", email);

      // Find admin by email
      const adminData = await admin.findOne({ email: email });

      if (!adminData) {
        console.log("Admin not found with email:", email);
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, adminData.password);

      if (!isMatch) {
        console.log("Password mismatch for admin:", email);
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: adminData.id,
        },
        config.JWT_ADMIN_PASSWORD,
        { expiresIn: "1d" }
      );

      console.log("Admin login successful for:", email);

      // Return token in response body instead of cookie
      res.status(200).json({
        message: "Admin Login Successfully",
        adminData: {
          id: adminData._id,
          username: adminData.username,
          email: adminData.email
        },
        token
      });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ error: "Error in Admin Login" });
    }
  };
export const logout = async (req, res) => {
    try {
        // Since we're using token-based authentication without cookies,
        // we don't need to clear cookies on the server side.
        // The client will handle logout by removing the token from localStorage.

        console.log("Admin logout request received");
        res.status(200).json({ message: "Admin Logout Successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ error: "Error in Logout" });
    }
};
export const getDashboardStats = async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      console.log("total user",totalUsers);
      const totalRooms = await Room.countDocuments();
      console.log("total rooms",totalRooms);
      const totalBookings = await Booking.countDocuments();
      console.log("total bookings ",totalBookings);
      res.status(200).json({
        totalUsers,
        totalRooms,
        totalBookings,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};


export const getAllBooking = async (req, res) => {
  try {
    console.log("Fetching all bookings");

    // Find all bookings and populate related fields
    // Use a try-catch block to handle potential errors in the query
    try {
      const allBookings = await Booking.find()
        .populate("userId", "name email")
        .populate("roomId", "title location price gender")
        .populate("creatorId", "name email")
        .populate("paymentId");

      console.log(`Found ${allBookings.length} bookings`);

      // Log each booking for debugging
      allBookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}: ID=${booking._id}, Status=${booking.status}, Amount=${booking.amount}`);
        console.log(`  User: ${booking.userId ? (booking.userId.name || 'Unknown') : 'N/A'}`);
        console.log(`  Room: ${booking.roomId ? (booking.roomId.title || 'Unknown') : 'N/A'}`);
      });

      res.status(200).json({
        message: "Booking data fetched successfully",
        totalBookings: allBookings.length,
        bookings: allBookings
      });
    } catch (queryError) {
      console.error("Error in booking query:", queryError);

      // Try a simpler query without population
      console.log("Trying simpler query without population...");
      const simpleBookings = await Booking.find();

      console.log(`Found ${simpleBookings.length} bookings (simple query)`);

      res.status(200).json({
        message: "Booking data fetched successfully (simple query)",
        totalBookings: simpleBookings.length,
        bookings: simpleBookings
      });
    }
  } catch (error) {
    console.error("Error fetching booking info:", error);
    res.status(500).json({
      message: "Failed to fetch booking info",
      error: error.message || "Unknown error"
    });
  }
};

export const getBookingInfo = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log("Fetching booking with ID:", bookingId);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    try {
      // Find booking by ID and populate related fields
      const booking = await Booking.findById(bookingId)
        .populate("userId", "name email")
        .populate("roomId", "title location price gender")
        .populate("creatorId", "name email")
        .populate("paymentId");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log("Booking details found:", booking);

      res.status(200).json({
        message: "Booking fetched successfully",
        booking,
      });
    } catch (queryError) {
      console.error("Error in booking query:", queryError);

      // Try a simpler query without population
      console.log("Trying simpler query without population...");
      const simpleBooking = await Booking.findById(bookingId);

      if (!simpleBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log("Simple booking details found:", simpleBooking);

      res.status(200).json({
        message: "Booking fetched successfully (simple query)",
        booking: simpleBooking,
      });
    }
  } catch (error) {
    console.error("Error fetching booking info:", error);
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message || "Unknown error"
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Fetching user with ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Failed to fetch user", error });
  }
};
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No room found" });
    }

    res.status(200).json({
      message: "Rooms fetched successfully",
      totalUsers: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Failed to fetch rooms", error });
  }
};
export const getRoomInfo = async(req,res)=>{
  try{
    const roomId = req.params.id;
    console.log("Fetching room with ID:", roomId);
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json({
      message: "Room fetched successfully",
      room,
    });
  }catch(error){
    console.error("Error fetching room info:", error);
    res.status(500).json({ message: "Failed to fetch room", error });
  }
};
export const getAllOwners = async (req, res) => {
  try {
    // Remove the role filter since the Owner model doesn't have a role field
    const owners = await Owner.find();
    console.log('Owners found:', owners);

    if (!owners || owners.length === 0) {
      return res.status(404).json({ message: "No owners found" });
    }

    res.status(200).json({
      message: "Owners fetched successfully",
      totalOwners: owners.length,
      owners,
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({ message: "Failed to fetch owners", error });
  }
};
export const getOwnerInfo= async (req, res) => {
  try {
    const ownerId = req.params.id;
    console.log("Fetching owner with ID:", ownerId);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid owner ID format" });
    }

    // Find the owner by ID and role

    const owner = await Owner.findById(ownerId );
    console.log("Found owner:", owner);

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.status(200).json({
      message: "Owner fetched successfully",
      owner,
    });

  } catch (error) {
    console.error("Error fetching owner:", error);
    res.status(500).json({ message: "Failed to fetch owner", error: error.message });
  }
}