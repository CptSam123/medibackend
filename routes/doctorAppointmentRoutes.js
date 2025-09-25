import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getDoctorAppointments,
  updateAppointmentStatus
} from '../controllers/doctorAppointmentController.js';

const router = express.Router();

// 🔒 Protect all routes
router.use(authMiddleware);

// GET /api/doctor/appointments
router.get('/appointments', getDoctorAppointments);

// PUT /api/doctor/appointments/:id
router.put('/appointments/:id', updateAppointmentStatus);

export default router;
