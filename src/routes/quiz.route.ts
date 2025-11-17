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
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved quiz data.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found.
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
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Quiz attempt submitted successfully.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: Successfully retrieved quiz progress.
 *       401:
 *         description: Unauthorized
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
 *       200:
 *         description: Successfully retrieved quiz stats.
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getUserQuizStats);

export default router;


// ============================================
// Add to your main app.ts or server.ts:
// ============================================
// import quizRoutes from './routes/quiz.routes';
// app.use('/api/v1/quiz', quizRoutes);