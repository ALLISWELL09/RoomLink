import express from 'express';
import {
    signup,
    login,
    logout,
    booked,
    getUserProfile,
    updateUserProfile,
    forgotPassword
} from "../controller/userController.js";
import {userMiddleware} from "../middleware/user.mid.js";

const router = express.Router();

// Authentication routes
router.post("/register", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/booked", userMiddleware, booked);
router.get("/profile", userMiddleware, getUserProfile);
router.put("/profile/update", userMiddleware, updateUserProfile);

export default router;