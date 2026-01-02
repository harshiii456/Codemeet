import { Router } from "express";
import {
    createRoom,
    checkRoom,
    joinRoom,
    leaveRoom,
    getUserRooms,
    getRoomDetails,
    updateRoomCode,
    deleteRoom,
    getAllActiveRooms
} from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes (require authentication)
router.route("/create").post(verifyJWT, createRoom);
router.route("/join").post(verifyJWT, joinRoom);
router.route("/leave").post(verifyJWT, leaveRoom);
router.route("/my-rooms").get(verifyJWT, getUserRooms);
router.route("/update-code").post(verifyJWT, updateRoomCode);
router.route("/:roomId").delete(verifyJWT, deleteRoom);

// Public routes (can check room existence without auth)
router.route("/check/:roomId").get(checkRoom);
router.route("/details/:roomId").get(verifyJWT, getRoomDetails);
router.route("/active").get(getAllActiveRooms);

export default router;
