import { Router } from 'express';
import { getCoursesByClass } from '../controllers/class.controller.js';
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js';

const router = Router();

router.route('/').get(requireSupabaseUser, getCoursesByClass);

export default router;
