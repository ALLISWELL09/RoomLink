import express from 'express';
import {
    createRoom,
    getRooms,
    updateRooms,
    deleteRoom,
    getRoomsById,
    buyRoom,
    getOwnerRooms,
    getLocations
} from "../controller/roomController.js";
import {userMiddleware} from "../middleware/user.mid.js";
import {ownerMiddleware} from "../middleware/owner.mid.js"

const router = express.Router();

// Room management routes (owner)
router.post("/createRooms", ownerMiddleware, createRoom);
router.put("/updateRooms/:roomId", ownerMiddleware, updateRooms);
router.delete("/deleteRooms/:roomId", ownerMiddleware, deleteRoom);
router.get("/owner-rooms", ownerMiddleware, getOwnerRooms);

// Public room routes
router.post("/getRooms", getRooms);
router.get("/getRoomsById/:roomId", getRoomsById);
router.get("/getLocations", getLocations);

// User routes
router.post("/buy/:roomId", userMiddleware, buyRoom); // Route for buying room

export default router;
