// routes/onboarding.routes.ts
import express from 'express';
import {
  updatePersonalization,
  updateLearningGoals,
  getAvailableClasses,
  selectClass,
  getUserCourses,
} from '../controllers/onboarding.controller.js';
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js'; // Your auth middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: User onboarding process
 */

// All routes require authentication
// router.use(requireSupabaseUser);

// ============================================
// ONBOARDING FLOW ROUTES
// ============================================

/**
 * @swagger
 * /onboarding/personalization/{userId}:
 *   patch:
 *     summary: "Step 1: Update user's basic personalization info"
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               age:
 *                 type: number
 *               currentClassLevel:
 *                 type: string
 *                 enum: [primary, secondary]
 *               preferredLanguage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personalization updated successfully.
 *       404:
 *         description: User not found.
 */
router.patch('/personalization/:userId', updatePersonalization);

/**
 * @swagger
 * /onboarding/learning-goals/{userId}:
 *   patch:
 *     summary: "Step 2: Update user's learning goals"
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               learningGoals:
 *                 type: array
 *                 items:
 *                   type: string
 *               learningDaysPerWeek:
 *                 type: string
 *               learningTimePerDay:
 *                 type: string
 *     responses:
 *       200:
 *         description: Learning goals updated successfully.
 *       404:
 *         description: User not found.
 */
router.patch('/learning-goals/:userId', updateLearningGoals);

/**
 * @swagger
 * /onboarding/classes/{userId}:
 *   get:
 *     summary: "Step 3: Get available classes for the user"
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved available classes.
 *       404:
 *         description: User not found.
 */
router.get('/classes/:userId', getAvailableClasses);

/**
 * @swagger
 * /onboarding/select-class/{userId}:
 *   post:
 *     summary: "Step 4: Select a specific class for the user"
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               classId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class selected successfully.
 *       404:
 *         description: User or class not found.
 */
router.post('/select-class/:userId', selectClass);

// ============================================
// USER COURSES ROUTE
// ============================================

/**
 * @swagger
 * /onboarding/my-courses/{userId}:
 *   get:
 *     summary: Get user's courses based on their selected class
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user's courses.
 *       404:
 *         description: User or class not found.
 */
router.get('/my-courses/:userId', getUserCourses);

export default router;
