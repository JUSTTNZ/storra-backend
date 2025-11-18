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

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: API for managing quizzes and user attempts
 */

// All quiz routes require authentication + Mongo profile
router.use(requireSupabaseUser, requireMongoProfile);

// ============================================
// QUIZ ROUTES
// ============================================

/**
 * @swagger
 * /quiz/course/{courseId}/quiz/{quizId}:
 *   get:
 *     summary: Get a specific quiz with user's progress
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "math-grade-7"
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *           example: "quiz-algebra-1"
 *     responses:
 *       '200':
 *         description: Successfully retrieved quiz data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Quiz data fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quiz:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         title:
 *                           type: string
 *                           example: "Algebra Basics Quiz"
 *                         description:
 *                           type: string
 *                           example: "A quiz to test basic algebra knowledge."
 *                         questions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               questionId:
 *                                 type: string
 *                                 example: "q1"
 *                               text:
 *                                 type: string
 *                                 example: "What is 2 + 2?"
 *                               options:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 example: ["3", "4", "5"]
 *                               type:
 *                                 type: string
 *                                 enum: [multiple-choice, true-false, fill-in-the-blank]
 *                                 example: "multiple-choice"
 *                         userProgress:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [not-started, in-progress, completed]
 *                               example: "in-progress"
 *                             score:
 *                               type: number
 *                               example: 75
 *                             attempts:
 *                               type: integer
 *                               example: 1
 *                             lastAttemptDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-10-27T10:30:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Quiz or course not found.
 */
router.get('/course/:courseId/quiz/:quizId', getQuizById);

/**
 * @swagger
 * /quiz/course/{courseId}/quiz/{quizId}/submit:
 *   post:
 *     summary: Submit a quiz attempt
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "math-grade-7"
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *           example: "quiz-algebra-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: "q1"
 *                     selectedAnswer:
 *                       type: string
 *                       example: "4"
 *                 description: An array of user's answers for each question.
 *     responses:
 *       '200':
 *         description: Quiz attempt submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Quiz attempt submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizResult:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         quizId:
 *                           type: string
 *                           example: "quiz-algebra-1"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         score:
 *                           type: number
 *                           example: 80
 *                         pointsEarned:
 *                           type: integer
 *                           example: 80
 *                         isPassed:
 *                           type: boolean
 *                           example: true
 *                         attemptNumber:
 *                           type: integer
 *                           example: 1
 *                         submittedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-27T11:00:00Z"
 *       '400':
 *         description: Invalid input or quiz already completed.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Quiz or course not found.
 */
router.post('/course/:courseId/quiz/:quizId/submit', submitQuizAttempt);

/**
 * @swagger
 * /quiz/course/{courseId}/progress:
 *   get:
 *     summary: Get user's quiz progress for a course
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "math-grade-7"
 *     responses:
 *       '200':
 *         description: Successfully retrieved quiz progress.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Quiz progress for course fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizProgress:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           quizId:
 *                             type: string
 *                             example: "quiz-algebra-1"
 *                           title:
 *                             type: string
 *                             example: "Algebra Basics Quiz"
 *                           status:
 *                             type: string
 *                             enum: [not-started, in-progress, completed]
 *                             example: "completed"
 *                           score:
 *                             type: number
 *                             example: 90
 *                           attempts:
 *                             type: integer
 *                             example: 1
 *                           lastAttemptDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-27T11:30:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Course or user quiz progress not found.
 */
router.get('/course/:courseId/progress', getUserQuizProgress);

/**
 * @swagger
 * /quiz/stats:
 *   get:
 *     summary: Get all of a user's quiz statistics
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved quiz stats.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User quiz statistics fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizStats:
 *                       type: object
 *                       properties:
 *                         totalQuizzesAttempted:
 *                           type: integer
 *                           example: 15
 *                         totalQuizzesCompleted:
 *                           type: integer
 *                           example: 12
 *                         averageScore:
 *                           type: number
 *                           format: float
 *                           example: 85.5
 *                         highestScore:
 *                           type: number
 *                           example: 100
 *                         totalPointsEarned:
 *                           type: integer
 *                           example: 1200
 *       '401':
 *         description: Unauthorized
 */
router.get('/stats', getUserQuizStats);

export default router;


// ============================================
// Add to your main app.ts or server.ts:
// ============================================
// import quizRoutes from './routes/quiz.routes';
// app.use('/api/v1/quiz', quizRoutes);