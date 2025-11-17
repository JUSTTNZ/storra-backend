// routes/lessonProgress.routes.ts
import { Router } from 'express';
import {
  getLessonProgress,
  getCourseLessonsProgress,
  updateLessonProgress,
  markLessonCompleted,
  toggleLessonBookmark,
  updateLessonNotes,
  getBookmarkedLessons,
  getCourseProgressOverview,
  getUserLearningStats,
} from '../controllers/lessonProgress.controller.js';

import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lesson Progress
 *   description: API for tracking user's lesson progress
 */

// All routes require authentication + Mongo profile
router.use(requireSupabaseUser, requireMongoProfile);

/**
 * @swagger
 * /progress/stats:
 *   get:
 *     summary: Get overall learning stats for the user
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved learning stats.
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getUserLearningStats);

/**
 * @swagger
 * /progress/bookmarks:
 *   get:
 *     summary: Get all bookmarked lessons for the user
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bookmarked lessons.
 *       401:
 *         description: Unauthorized
 */
router.get('/bookmarks', getBookmarkedLessons);

/**
 * @swagger
 * /progress/course/{courseId}:
 *   get:
 *     summary: Get a progress overview for a specific course
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Successfully retrieved course progress overview.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course progress not found.
 */
router.get('/course/:courseId', getCourseProgressOverview);

/**
 * @swagger
 * /progress/course/{courseId}/lessons:
 *   get:
 *     summary: Get progress for all lessons within a course
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Successfully retrieved all lesson progresses for the course.
 *       401:
 *         description: Unauthorized
 */
router.get('/course/:courseId/lessons', getCourseLessonsProgress);

/**
 * @swagger
 * /progress/lesson/{lessonId}:
 *   get:
 *     summary: Get progress for a specific lesson
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson
 *     responses:
 *       200:
 *         description: Successfully retrieved lesson progress.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson progress not found.
 */
router.get('/lesson/:lessonId', getLessonProgress);

/**
 * @swagger
 * /progress/lesson/{lessonId}:
 *   put:
 *     summary: Update progress for a specific lesson
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, completed]
 *               score:
 *                 type: number
 *               timeSpent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully updated lesson progress.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized
 */
router.put('/lesson/:lessonId', updateLessonProgress);

/**
 * @swagger
 * /progress/lesson/{lessonId}/complete:
 *   post:
 *     summary: Mark a lesson as completed
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson
 *     responses:
 *       200:
 *         description: Lesson marked as completed successfully.
 *       401:
 *         description: Unauthorized
 */
router.post('/lesson/:lessonId/complete', markLessonCompleted);

/**
 * @swagger
 * /progress/lesson/{lessonId}/bookmark:
 *   put:
 *     summary: Toggle a bookmark for a lesson
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully.
 *       401:
 *         description: Unauthorized
 */
router.put('/lesson/:lessonId/bookmark', toggleLessonBookmark);

/**
 * @swagger
 * /progress/lesson/{lessonId}/notes:
 *   put:
 *     summary: Update notes for a lesson
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notes updated successfully.
 *       401:
 *         description: Unauthorized
 */
router.put('/lesson/:lessonId/notes', updateLessonNotes);

export default router;
