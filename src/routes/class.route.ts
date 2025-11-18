import { Router } from 'express';
import { getCoursesByClass, getCourseTopics } from '../controllers/class.controller.js';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Class
 *   description: Class and course management
 */

/**
 * @swagger
 * /class/courses:
 *   get:
 *     summary: Get courses for the user's current class
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved courses
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User profile or class not found
 */
router.get('/courses', requireSupabaseUser, requireMongoProfile, getCoursesByClass);

/**
 * @swagger
 * /class/courses/{courseId}/topics:
 *   get:
 *     summary: Get topics for a specific course
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Successfully retrieved course topics
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Course not found
 */
router.get('/courses/:courseId/topics', requireSupabaseUser, requireMongoProfile, getCourseTopics);

export default router;
