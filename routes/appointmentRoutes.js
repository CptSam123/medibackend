import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';   // <-- use your file

const router = express.Router();

router.post('/',       authMiddleware, createAppointment);
router.get('/mine',    authMiddleware, getMyAppointments); // <-- /mine route
router.delete('/:id',  authMiddleware, cancelAppointment);

export default router;
