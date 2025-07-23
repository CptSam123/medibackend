import express from "express";
import {
  getAllDoctors,
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.post("/", auth, createDoctorProfile);         // Protected
router.get("/profile", auth, getDoctorProfile);      // Protected
router.put("/profile", auth, updateDoctorProfile);   // Protected

export default router;
