import express from "express";
import { claimDailyLoginReward, getDailyRewardInfo } from "../controllers/daily.controller.js";
import { requireSupabaseUser } from "../middlewares/supabaseAuth.js";

const router = express.Router();

// All reward routes need both auth + mongo profile
router.use(requireSupabaseUser,);

router.get("/info", getDailyRewardInfo);
router.post("/claim", claimDailyLoginReward);

export default router;
