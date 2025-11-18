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
 *       '200':
 *         description: Successfully retrieved learning stats.
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
 *                   example: "Learning stats fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     learningStats:
 *                       type: object
 *                       properties:
 *                         totalLessonsCompleted:
 *                           type: integer
 *                           example: 50
 *                         totalCoursesCompleted:
 *                           type: integer
 *                           example: 5
 *                         timeSpentLearning:
 *                           type: integer
 *                           description: Total time spent learning in minutes.
 *                           example: 1200
 *                         currentStreak:
 *                           type: integer
 *                           example: 7
 *       '401':
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
 *       '200':
 *         description: Successfully retrieved bookmarked lessons.
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
 *                   example: "Bookmarked lessons fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookmarkedLessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           lessonId:
 *                             type: string
 *                             example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                           title:
 *                             type: string
 *                             example: "Introduction to Algebra"
 *                           courseId:
 *                             type: string
 *                             example: "math-grade-7"
 *                           courseTitle:
 *                             type: string
 *                             example: "Mathematics Grade 7"
 *                           isCompleted:
 *                             type: boolean
 *                             example: false
 *                           progress:
 *                             type: number
 *                             example: 0.75
 *       '401':
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
 *       '200':
 *         description: Successfully retrieved course progress overview.
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
 *                   example: "Course progress overview fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseProgressOverview:
 *                       type: object
 *                       properties:
 *                         courseId:
 *                           type: string
 *                           example: "math-grade-7"
 *                         title:
 *                           type: string
 *                           example: "Mathematics Grade 7"
 *                         totalLessons:
 *                           type: integer
 *                           example: 20
 *                         completedLessons:
 *                           type: integer
 *                           example: 15
 *                         progressPercentage:
 *                           type: number
 *                           format: float
 *                           example: 75.0
 *                         lastAccessed:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-27T10:00:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
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
 *       '200':
 *         description: Successfully retrieved all lesson progresses for the course.
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
 *                   example: "Course lessons progress fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessonsProgress:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           lessonId:
 *                             type: string
 *                             example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                           title:
 *                             type: string
 *                             example: "Lesson 1: Basic Concepts"
 *                           status:
 *                             type: string
 *                             enum: [not-started, in-progress, completed]
 *                             example: "in-progress"
 *                           progress:
 *                             type: number
 *                             format: float
 *                             example: 0.5
 *                           isBookmarked:
 *                             type: boolean
 *                             example: false
 *                           notes:
 *                             type: string
 *                             example: "Key points to remember: ..."
 *       '401':
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
 *       '200':
 *         description: Successfully retrieved lesson progress.
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
 *                   example: "Lesson progress fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessonProgress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         lessonId:
 *                           type: string
 *                           example: "lesson-101"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         status:
 *                           type: string
 *                           enum: [not-started, in-progress, completed]
 *                           example: "completed"
 *                         progress:
 *                           type: number
 *                           format: float
 *                           example: 1.0
 *                         score:
 *                           type: number
 *                           example: 95
 *                         timeSpent:
 *                           type: number
 *                           description: Time spent on the lesson in minutes.
 *                           example: 30
 *                         isBookmarked:
 *                           type: boolean
 *                           example: true
 *                         notes:
 *                           type: string
 *                           example: "Important concepts: ..."
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T12:00:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-05T14:30:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
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
 *                 example: "in-progress"
 *               score:
 *                 type: number
 *                 example: 85
 *               timeSpent:
 *                 type: number
 *                 example: 25
 *     responses:
 *       '200':
 *         description: Successfully updated lesson progress.
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
 *                   example: "Lesson progress updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedLessonProgress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         lessonId:
 *                           type: string
 *                           example: "lesson-101"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         status:
 *                           type: string
 *                           enum: [not-started, in-progress, completed]
 *                           example: "in-progress"
 *                         progress:
 *                           type: number
 *                           format: float
 *                           example: 0.8
 *                         score:
 *                           type: number
 *                           example: 85
 *                         timeSpent:
 *                           type: number
 *                           description: Time spent on the lesson in minutes.
 *                           example: 25
 *                         isBookmarked:
 *                           type: boolean
 *                           example: false
 *                         notes:
 *                           type: string
 *                           example: "Updated notes for the lesson."
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T12:00:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-05T15:00:00Z"
 *       '400':
 *         description: Invalid input.
 *       '401':
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
 *       '200':
 *         description: Lesson marked as completed successfully.
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
 *                   example: "Lesson marked as completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     completedLessonProgress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         lessonId:
 *                           type: string
 *                           example: "lesson-101"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         status:
 *                           type: string
 *                           enum: [not-started, in-progress, completed]
 *                           example: "completed"
 *                         progress:
 *                           type: number
 *                           format: float
 *                           example: 1.0
 *                         isBookmarked:
 *                           type: boolean
 *                           example: false
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-05T16:00:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Lesson progress not found.
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
 *       '200':
 *         description: Bookmark toggled successfully.
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
 *                   example: "Lesson bookmark toggled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedLessonProgress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         lessonId:
 *                           type: string
 *                           example: "lesson-101"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         isBookmarked:
 *                           type: boolean
 *                           example: true
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-05T17:00:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Lesson progress not found.
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
 *                 example: "These are my updated notes for the lesson."
 *     responses:
 *       '200':
 *         description: Notes updated successfully.
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
 *                   example: "Lesson notes updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedLessonProgress:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         lessonId:
 *                           type: string
 *                           example: "lesson-101"
 *                         userId:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b5"
 *                         notes:
 *                           type: string
 *                           example: "These are my updated notes for the lesson."
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-05T18:00:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Lesson progress not found.
 */
router.put('/lesson/:lessonId/notes', updateLessonNotes);

export default router;
