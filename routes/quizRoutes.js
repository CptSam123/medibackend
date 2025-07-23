import express from 'express';
import { submitQuiz, getUserQuizHistory } from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', authMiddleware, submitQuiz);
router.get('/history', authMiddleware, getUserQuizHistory);

export default router;
