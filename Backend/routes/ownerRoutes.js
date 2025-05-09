import express from "express";
import {signup, login, logout, getDashboardStats, getRecentBookings, getOwnerProfile} from "../controller/ownerController.js"
import {ownerMiddleware} from "../middleware/owner.mid.js"


const router = express.Router();

// Auth routes
router.post("/register", signup);
router.post("/login", login);
router.get("/logout", logout);

// Dashboard routes
router.get("/dashboard/stats", ownerMiddleware, getDashboardStats);
router.get("/dashboard/recent-bookings", ownerMiddleware, getRecentBookings);
router.get("/profile", ownerMiddleware, getOwnerProfile);

export default router;