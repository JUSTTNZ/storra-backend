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
 *     description: Fetches all reward-related information for the authenticated user, including balances, daily login streaks, and achievements.
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user rewards.
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
 *                   example: "User rewards fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userRewards:
 *                       type: object
 *                       properties:
 *                         totalCoins:
 *                           type: integer
 *                           example: 250
 *                         totalPoints:
 *                           type: integer
 *                           example: 1200
 *                         totalDiamonds:
 *                           type: integer
 *                           example: 5
 *                         spinChances:
 *                           type: integer
 *                           example: 3
 *                         currentStreak:
 *                           type: integer
 *                           example: 7
 *                         longestStreak:
 *                           type: integer
 *                           example: 15
 *                         lastLoginDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-27T08:00:00Z"
 *                         dailyRewards:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               day:
 *                                 type: integer
 *                                 example: 1
 *                               month:
 *                                 type: integer
 *                                 example: 10
 *                               year:
 *                                 type: integer
 *                                 example: 2023
 *                               rewards:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     type:
 *                                       type: string
 *                                       enum: [coins, points, spin_chance, trial_access, diamond]
 *                                       example: "coins"
 *                                     amount:
 *                                       type: integer
 *                                       example: 10
 *                                     description:
 *                                       type: string
 *                                       example: "Day 1 login bonus"
 *                               claimed:
 *                                 type: boolean
 *                                 example: true
 *                               claimedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-10-27T08:05:00Z"
 *                         achievements:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               achievementId:
 *                                 type: string
 *                                 example: "first_login"
 *                               title:
 *                                 type: string
 *                                 example: "Welcome Aboard!"
 *                               description:
 *                                 type: string
 *                                 example: "Complete your first login"
 *                               unlockedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-10-26T09:00:00Z"
 *                               claimed:
 *                                 type: boolean
 *                                 example: true
 *                               claimedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-10-26T09:05:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User rewards profile not found.
 */
router.get('/', getUserRewards);

/**
 * @swagger
 * /rewards/daily-claim:
 *   post:
 *     summary: Claim daily login reward
 *     description: Allows the authenticated user to claim their daily login reward, updating their balances and streak.
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Daily reward claimed successfully.
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
 *                   example: "Daily reward claimed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUserRewards:
 *                       type: object
 *                       properties:
 *                         totalCoins:
 *                           type: integer
 *                           example: 260
 *                         totalPoints:
 *                           type: integer
 *                           example: 1200
 *                         spinChances:
 *                           type: integer
 *                           example: 3
 *                         currentStreak:
 *                           type: integer
 *                           example: 8
 *                         claimedDailyReward:
 *                           type: object
 *                           properties:
 *                             day:
 *                               type: integer
 *                               example: 8
 *                             rewards:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                     enum: [coins, points, spin_chance, trial_access, diamond]
 *                                     example: "coins"
 *                                   amount:
 *                                     type: integer
 *                                     example: 15
 *                                   description:
 *                                     type: string
 *                                     example: "Day 8 login bonus"
 *                             claimedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-10-28T08:05:00Z"
 *       '401':
 *         description: Unauthorized
 *       '409':
 *         description: Daily reward already claimed today or no reward available for today.
 *       '404':
 *         description: User rewards profile not found.
 */
router.post('/daily-claim', claimDailyReward);

/**
 * @swagger
 * /rewards/achievement/{achievementId}/claim:
 *   post:
 *     summary: Claim an achievement reward
 *     description: Allows the authenticated user to claim a specific achievement's reward.
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *           example: "first_login"
 *         description: The ID of the achievement to claim.
 *     responses:
 *       '200':
 *         description: Achievement claimed successfully.
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
 *                   example: "Achievement claimed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUserRewards:
 *                       type: object
 *                       properties:
 *                         totalCoins:
 *                           type: integer
 *                           example: 310
 *                         totalPoints:
 *                           type: integer
 *                           example: 1200
 *                         spinChances:
 *                           type: integer
 *                           example: 3
 *                         claimedAchievement:
 *                           type: object
 *                           properties:
 *                             achievementId:
 *                               type: string
 *                               example: "first_login"
 *                             title:
 *                               type: string
 *                               example: "Welcome Aboard!"
 *                             rewardType:
 *                               type: string
 *                               enum: [coins, points, spin_chance, trial_access, diamond]
 *                               example: "coins"
 *                             rewardAmount:
 *                               type: integer
 *                               example: 50
 *                             claimedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-10-28T09:00:00Z"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Achievement not found or not yet earned.
 *       '409':
 *         description: Achievement already claimed.
 */
router.post('/achievement/:achievementId/claim', claimAchievement);

/**
 * @swagger
 * /rewards/calendar:
 *   get:
 *     summary: Get the daily rewards calendar
 *     description: Retrieves the full daily rewards calendar, showing which rewards are available for each day and if they have been claimed.
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved daily rewards calendar.
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
 *                   example: "Daily rewards calendar fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     dailyRewardsCalendar:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: integer
 *                             example: 1
 *                           month:
 *                             type: integer
 *                             example: 10
 *                           year:
 *                             type: integer
 *                             example: 2023
 *                           rewards:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                   enum: [coins, points, spin_chance, trial_access, diamond]
 *                                   example: "coins"
 *                                 amount:
 *                                   type: integer
 *                                   example: 10
 *                                 description:
 *                                   type: string
 *                                   example: "Day 1 login bonus"
 *                           claimed:
 *                             type: boolean
 *                             example: true
 *                           claimedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-27T08:05:00Z"
 *       '401':
 *         description: Unauthorized
 */
router.get('/calendar', getDailyRewardsCalendar);

export default router;
