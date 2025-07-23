import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
// import { adminOnly } from '../middlewares/roleMiddleware.js';
import {
  listUsers,
  listDoctors,
  getUserDetail,
  getDoctorDetail,
  updateUser,
  deleteUser, // ← import updateDoctor
  deleteDoctor,   // ← import deleteDoctor
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth + admin-only middleware if desired
// router.use(authMiddleware, adminOnly);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/doctors', listDoctors);
router.get('/doctors/:id', getDoctorDetail);
//router.put('/doctors/:id', updateDoctor);    // ← enable doctor update
router.delete('/doctors/:id', deleteDoctor); // ← enable doctor delete

export default router;
