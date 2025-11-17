// routes/reward.routes.ts
import { Router } from 'express';
import {
  getUserRewards,
  claimDailyReward,
  claimAchievement,
  getDailyRewardsCalendar,
} from '../controllers/rewards.controller.js';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: API for managing user rewards and achievements
 */

// All reward routes need both auth + mongo profile
router.use(requireSupabaseUser, requireMongoProfile);

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: Get user's rewards dashboard
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user rewards.
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserRewards);

/**
 * @swagger
 * /rewards/daily-claim:
 *   post:
 *     summary: Claim daily login reward
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily reward claimed successfully.
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Daily reward already claimed today.
 */
router.post('/daily-claim', claimDailyReward);

/**
 * @swagger
 * /rewards/achievement/{achievementId}/claim:
 *   post:
 *     summary: Claim an achievement reward
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the achievement to claim.
 *     responses:
 *       200:
 *         description: Achievement claimed successfully.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Achievement not found or not yet earned.
 *       409:
 *         description: Achievement already claimed.
 */
router.post('/achievement/:achievementId/claim', claimAchievement);

/**
 * @swagger
 * /rewards/calendar:
 *   get:
 *     summary: Get the daily rewards calendar
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved daily rewards calendar.
 *       401:
 *         description: Unauthorized
 */
router.get('/calendar', getDailyRewardsCalendar);

export default router;
