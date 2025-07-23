import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import auth from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", auth, sendMessage);
router.get("/:userId", auth, getMessages);
export default router;
