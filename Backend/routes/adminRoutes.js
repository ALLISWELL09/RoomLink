import express  from "express";
import {
    login,
    logout,
    getDashboardStats,
    getAllBooking,
    getBookingInfo,
    getUserInfo,
    getAllUsers,
    getRoomInfo,
    getAllRooms,
    getAllOwners,
    getOwnerInfo
} from "../controller/adminController.js";


const router = express.Router();

router.post("/login",login);
router.get("/logout",logout);
router.get("/dashboard",getDashboardStats);
router.get("/booking",getAllBooking);
router.get("/booking/:id",getBookingInfo);
router.get("/user",getAllUsers);
router.get("/user/:id",getUserInfo);
router.get("/room",getAllRooms);
router.get("/room/:id",getRoomInfo);
router.get("/owner",getAllOwners);
router.get("/owner/:id",getOwnerInfo);
export default router