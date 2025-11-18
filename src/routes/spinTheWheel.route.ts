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
 *     tags: [Spin The Wheel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully spun the wheel and received a reward.
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Spin already used for today.
 */
router.post("/spinthewheel", requireSupabaseUser, requireMongoProfile, spinTheWheel);

export default router;
