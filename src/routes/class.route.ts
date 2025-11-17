import { Router } from 'express';
import { getCoursesByClass, getCourseTopics } from '../controllers/class.controller.js';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();

router.get('/courses', requireSupabaseUser, requireMongoProfile, getCoursesByClass);
router.get('/courses/:courseId/topics', requireSupabaseUser, requireMongoProfile, getCourseTopics);

export default router;
