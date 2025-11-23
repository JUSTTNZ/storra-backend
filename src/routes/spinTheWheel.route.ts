// routes/spin.routes.ts
import { Router } from "express";
import { requireSupabaseUser, requireMongoProfile } from "../middlewares/supabaseAuth.js";
import { spinTheWheel, getWheelPreview } from "../controllers/spinTheWheel.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Spin The Wheel
 *   description: API for the 'Spin The Wheel' game
 */

/**
 * @swagger
 * /spinTheWheel/spinthewheel:
 *   post:
 *     summary: Spin the wheel to get a reward
 *     description: Allows the authenticated user to spin the wheel and receive a random reward, consuming one spin chance.
 *     tags: [Spin The Wheel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully spun the wheel and received a reward.
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
 *                   example: "Wheel spun successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reward:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [coins, points, spin_chance, trial_access, diamond]
 *                           example: "coins"
 *                         amount:
 *                           type: integer
 *                           example: 50
 *                         description:
 *                           type: string
 *                           example: "You won 50 coins!"
 *                     balances:
 *                       type: object
 *                       properties:
 *                         coins:
 *                           type: integer
 *                           example: 120
 *                         points:
 *                           type: integer
 *                           example: 50
 *                         diamonds:
 *                           type: integer
 *                           example: 25
 *                         spinChances:
 *                           type: integer
 *                           example: 2
 *       '401':
 *         description: Unauthorized
 *       '409':
 *         description: No spin chances available or spin already used for today.
 *       '500':
 *         description: Failed to spin the wheel due to a server error.
 */
router.post("/spinthewheel", requireSupabaseUser, requireMongoProfile, spinTheWheel);

/**
 * @swagger
 * /spinTheWheel/wheel-preview:
 *   get:
 *     summary: Get a preview of the spin wheel rewards
 *     description: Fetches common rewards to display on the wheel in the frontend. Rare rewards are hidden as mystery.
 *     tags: [Spin The Wheel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of common rewards to show on the wheel
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
 *                   example: "Wheel preview rewards"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "1 Diamond"
 *                       type:
 *                         type: string
 *                         enum: [coins, points, spin_chance, diamond, item]
 *                         example: "diamond"
 */
router.get("/wheel-preview", requireSupabaseUser, requireMongoProfile, getWheelPreview);

export default router;
