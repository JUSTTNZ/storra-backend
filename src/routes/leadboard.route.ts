import { Router } from 'express';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';
import { getLeaderboard } from '../controllers/leadboard.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Leaderboard management
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get the leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the leaderboard
 *       401:
 *         description: Not authenticated
 */
router.get('/', getLeaderboard);

export default router;
