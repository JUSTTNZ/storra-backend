// routes/reward.routes.ts
import { Router } from 'express';
import {
  getUserRewards,
  claimDailyReward,
  claimAchievement,
  getDailyRewardsCalendar,
} from '../controllers/rewards.controller.js';
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js';

const router = Router();

// All routes require authentication
router.use(requireSupabaseUser);

// GET /api/v1/rewards - Get user's rewards dashboard
router.get('/', getUserRewards);

// POST /api/v1/rewards/daily-claim - Claim daily login reward
router.post('/daily-claim', claimDailyReward);

// POST /api/v1/rewards/achievement/:achievementId/claim - Claim achievement reward
router.post('/achievement/:achievementId/claim', claimAchievement);

// GET /api/v1/rewards/calendar - Get daily rewards calendar for current month
router.get('/calendar', getDailyRewardsCalendar);

export default router;