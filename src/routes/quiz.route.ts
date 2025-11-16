// routes/quiz.routes.ts
import express from 'express';
import {
  getQuizById,
  submitQuizAttempt,
  getUserQuizProgress,
  getUserQuizStats,

} from '../controllers/quiz.controller.js';
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js'

const router = express.Router();

// All routes require authentication
router.use(requireSupabaseUser);

// ============================================
// QUIZ ROUTES
// ============================================

// Get specific quiz with user progress
router.get('/course/:courseId/quiz/:quizId', getQuizById);
// GET /api/v1/quiz/course/jss1-math/quiz/jss1-math-quiz
// Returns: Quiz questions (without correct answers) + user's progress

// Submit quiz attempt
router.post('/course/:courseId/quiz/:quizId/submit', submitQuizAttempt);
// POST /api/v1/quiz/course/jss1-math/quiz/jss1-math-quiz/submit
// Body: {
//   answers: [
//     { questionId: "q1", selectedAnswer: "Option B" },
//     { questionId: "q2", selectedAnswer: "Option A" }
//   ],
//   timeSpent: 300 // seconds
// }
// Returns: Score, percentage, status (complete/incomplete), points earned

// Get user's quiz progress for a course
router.get('/course/:courseId/progress', getUserQuizProgress);
// GET /api/v1/quiz/course/jss1-math/progress
// Returns: All quiz progress for the course

// Get all user's quiz statistics
router.get('/stats', getUserQuizStats);
// GET /api/v1/quiz/stats
// Returns: Total quizzes, completed, incomplete, total points, etc.


export default router;

// ============================================
// Add to your main app.ts or server.ts:
// ============================================
// import quizRoutes from './routes/quiz.routes';
// app.use('/api/v1/quiz', quizRoutes);