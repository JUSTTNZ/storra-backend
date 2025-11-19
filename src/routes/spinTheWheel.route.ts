// routes/spin.routes.ts
import { Router } from "express";
import { requireSupabaseUser, requireMongoProfile } from "../middlewares/supabaseAuth.js";
import { spinTheWheel } from "../controllers/spinTheWheel.controller.js";

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
 *                     updatedSpinChances:
 *                       type: integer
 *                       example: 1
 *       '401':
 *         description: Unauthorized
 *       '409':
 *         description: No spin chances available or spin already used for today.
 *       '500':
 *         description: Failed to spin the wheel due to a server error.
 */
router.post("/spinthewheel", requireSupabaseUser, requireMongoProfile, spinTheWheel);

export default router;
