// server/routes/userRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';  // default import
import { getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', authMiddleware, getCurrentUser);

export default router;
