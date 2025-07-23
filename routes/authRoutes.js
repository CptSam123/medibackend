import express from "express";
import { register, login ,sendOtp, verifyOtp,forgotPasswordOTP,resetPasswordWithOTP} from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);

router.post('/send-otp',  sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password',    forgotPasswordOTP);
router.post('/forgot-password/verify', resetPasswordWithOTP);

export default router;
