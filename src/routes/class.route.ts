import { Router } from 'express';
import { getCoursesByClass, getCourseTopics } from '../controllers/class.controller.js';
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js';

const router = Router();

router.get('/courses', requireSupabaseUser, getCoursesByClass);
router.get('/courses/:courseId/topics', requireSupabaseUser, getCourseTopics);

export default router;
