// routes/spin.routes.ts
import { Router } from "express";
import { requireSupabaseUser, requireMongoProfile } from "../middlewares/supabaseAuth.js";
import { spinTheWheel } from "../controllers/spinTheWheel.controller.js";

const router = Router();

router.post("/spinthewheel", requireSupabaseUser, requireMongoProfile, spinTheWheel);

export default router;
