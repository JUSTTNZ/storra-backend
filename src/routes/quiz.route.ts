// routes/quiz.routes.ts
import express from 'express';
import {
  getQuizById,
  submitQuizAttempt,
  getUserQuizProgress,
  getUserQuizStats,
} from '../controllers/quiz.controller.js';

import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = express.Router();

// All quiz routes require authentication + Mongo profile
router.use(requireSupabaseUser, requireMongoProfile);

// ============================================
// QUIZ ROUTES
// ============================================

// Get specific quiz with user progress
router.get('/course/:courseId/quiz/:quizId', getQuizById);

// Submit quiz attempt
router.post('/course/:courseId/quiz/:quizId/submit', submitQuizAttempt);

// Get user's quiz progress for a course
router.get('/course/:courseId/progress', getUserQuizProgress);

// Get all user's quiz statistics
router.get('/stats', getUserQuizStats);

export default router;


// ============================================
// Add to your main app.ts or server.ts:
// ============================================
// import quizRoutes from './routes/quiz.routes';
// app.use('/api/v1/quiz', quizRoutes);