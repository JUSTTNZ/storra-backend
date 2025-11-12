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

// All routes require authentication
// router.use(requireSupabaseUser);

// ============================================
// ONBOARDING FLOW ROUTES
// ============================================

// Step 1: Update basic personalization (age, class level, language)
router.patch('/personalization/:userId', updatePersonalization);
// PATCH /api/v1/onboarding/personalization/USER_ID
// Body: { age: 15, currentClassLevel: 'primary', preferredLanguage: 'English' }

// Step 2: Update learning goals
router.patch('/learning-goals/:userId', updateLearningGoals);
// PATCH /api/v1/onboarding/learning-goals/USER_ID
// Body: {
//   learningGoals: ['Reading faster', 'Spelling'],
//   learningDaysPerWeek: '3 days',
//   learningTimePerDay: '15-30 mins'
// }

// Step 3: Get available classes (for primary & secondary students)
router.get('/classes/:userId', getAvailableClasses);
// GET /api/v1/onboarding/classes/USER_ID
// Returns: List of available classes based on user's currentClassLevel

// Step 4: Select specific class
router.post('/select-class/:userId', selectClass);
// POST /api/v1/onboarding/select-class/USER_ID
// Body: { classId: 'primary-1' }

// ============================================
// USER COURSES ROUTE
// ============================================

// Get user's courses based on selected class
router.get('/my-courses/:userId', getUserCourses);
// GET /api/v1/onboarding/my-courses/USER_ID
// Returns: All courses for the user's selected class

export default router;
