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
 *     summary: Get the paginated leaderboard
 *     description: Fetches a sorted and ranked list of users based on their total points. Supports pagination.
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: The number of items to return per page.
 *     responses:
 *       '200':
 *         description: Leaderboard fetched successfully.
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
 *                   example: "Leaderboard fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: string
 *                             example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                           fullname:
 *                             type: string
 *                             example: "Jane Doe"
 *                           profilePictureUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/avatar.png"
 *                           totalPoints:
 *                             type: integer
 *                             example: 1250
 *                     meta:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *       '400':
 *         description: Invalid pagination parameters.
 *       '401':
 *         description: Not authenticated.
 */
router.get('/', getLeaderboard);

export default router;
