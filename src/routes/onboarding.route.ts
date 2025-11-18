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
 *           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *                 example: 10
 *               currentClassLevel:
 *                 type: string
 *                 enum: [primary, secondary]
 *                 example: "primary"
 *               preferredLanguage:
 *                 type: string
 *                 example: "English"
 *     responses:
 *       '200':
 *         description: Personalization updated successfully.
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
 *                   example: "Personalization updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         fullname:
 *                           type: string
 *                           example: "John Doe"
 *                         age:
 *                           type: number
 *                           example: 10
 *                         currentClassLevel:
 *                           type: string
 *                           enum: [primary, secondary]
 *                           example: "primary"
 *                         preferredLanguage:
 *                           type: string
 *                           example: "English"
 *                         hasCompletedOnboarding:
 *                           type: boolean
 *                           example: false
 *       '404':
 *         description: User not found.
 *       '401':
 *         description: Unauthorized.
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
 *           example: "60d5f2b4a6d5f2b4a6d5f2b4"
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
 *                 example: ["Improve Math", "Learn English"]
 *               learningDaysPerWeek:
 *                 type: string
 *                 example: "5 days"
 *               learningTimePerDay:
 *                 type: string
 *                 example: "1 hour"
 *     responses:
 *       '200':
 *         description: Learning goals updated successfully.
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
 *                   example: "Learning goals updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         fullname:
 *                           type: string
 *                           example: "John Doe"
 *                         learningGoals:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Improve Math", "Learn English"]
 *                         learningDaysPerWeek:
 *                           type: string
 *                           example: "5 days"
 *                         learningTimePerDay:
 *                           type: string
 *                           example: "1 hour"
 *                         hasCompletedOnboarding:
 *                           type: boolean
 *                           example: false
 *       '404':
 *         description: User not found.
 *       '401':
 *         description: Unauthorized.
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
 *           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *     responses:
 *       '200':
 *         description: Successfully retrieved available classes.
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
 *                   example: "Available classes fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableClasses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: string
 *                             example: "primary-1"
 *                           name:
 *                             type: string
 *                             example: "Primary 1"
 *                           level:
 *                             type: string
 *                             enum: [primary, junior-secondary, senior-secondary]
 *                             example: "primary"
 *                           description:
 *                             type: string
 *                             example: "First year of primary education."
 *       '404':
 *         description: User not found.
 *       '401':
 *         description: Unauthorized.
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
 *           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 example: "primary-1"
 *     responses:
 *       '200':
 *         description: Class selected successfully.
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
 *                   example: "Class selected successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         fullname:
 *                           type: string
 *                           example: "John Doe"
 *                         currentClassId:
 *                           type: string
 *                           example: "primary-1"
 *                         educationLevel:
 *                           type: string
 *                           enum: [primary, junior-secondary, senior-secondary]
 *                           example: "primary"
 *                         hasCompletedOnboarding:
 *                           type: boolean
 *                           example: true
 *       '404':
 *         description: User or class not found.
 *       '401':
 *         description: Unauthorized.
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
 *           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *     responses:
 *       '200':
 *         description: Successfully retrieved user's courses.
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
 *                   example: "User courses fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                             example: "math-primary-1"
 *                           title:
 *                             type: string
 *                             example: "Primary 1 Mathematics"
 *                           description:
 *                             type: string
 *                             example: "Covers basic arithmetic and geometry for primary one students."
 *                           thumbnail:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/math-thumbnail.png"
 *       '404':
 *         description: User or class not found.
 *       '401':
 *         description: Unauthorized.
 */
router.get('/my-courses/:userId', getUserCourses);

export default router;
