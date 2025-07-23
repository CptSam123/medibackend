// server/routes/doctorAppointmentRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  listDoctorAppointments,
  updateAppointmentStatus,getDoctorAppointments 
} from '../controllers/doctorAppointmentController.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/doctor/appointments
router.get('/appointments', listDoctorAppointments);

// PUT /api/doctor/appointments/:id
router.put('/appointments/:id', updateAppointmentStatus);
router.get('/appointments', getDoctorAppointments); // ✅ add this

export default router;
