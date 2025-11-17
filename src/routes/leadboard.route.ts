import { Router } from 'express';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';
import { getLeaderboard } from '../controllers/leadboard.controller.js';

const router = Router();

router.get('/', requireSupabaseUser, requireMongoProfile, getLeaderboard);

export default router;
