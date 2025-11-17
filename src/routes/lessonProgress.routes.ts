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
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js';
const router = Router();

// All routes require authentication
router.use(requireSupabaseUser);

// GET /api/v1/progress/stats - Get overall learning stats
router.get('/stats', getUserLearningStats);

// GET /api/v1/progress/bookmarks - Get all bookmarked lessons
router.get('/bookmarks', getBookmarkedLessons);

// GET /api/v1/progress/course/:courseId - Get course progress overview
router.get('/course/:courseId', getCourseProgressOverview);

// GET /api/v1/progress/course/:courseId/lessons - Get all lessons progress for a course
router.get('/course/:courseId/lessons', getCourseLessonsProgress);

// GET /api/v1/progress/lesson/:lessonId - Get specific lesson progress
router.get('/lesson/:lessonId', getLessonProgress);

// PUT /api/v1/progress/lesson/:lessonId - Update lesson progress
router.put('/lesson/:lessonId', updateLessonProgress);

// POST /api/v1/progress/lesson/:lessonId/complete - Mark lesson as completed
router.post('/lesson/:lessonId/complete', markLessonCompleted);

// PUT /api/v1/progress/lesson/:lessonId/bookmark - Toggle bookmark
router.put('/lesson/:lessonId/bookmark', toggleLessonBookmark);

// PUT /api/v1/progress/lesson/:lessonId/notes - Update notes
router.put('/lesson/:lessonId/notes', updateLessonNotes);

export default router;