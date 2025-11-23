import cron from "node-cron";

import { UserRewards } from "../Models/rewards.model.js";

// Connect to MongoDB if not already connected
// (Skip this if your app already connects on startup)

// ✅ Schedule a job at 12:00 AM every day
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await UserRewards.updateMany(
      {},
      {
        $set: { spinChances: 3 } // Reset spins
      }
    );
    console.log(`[${new Date().toISOString()}] Reset spins for ${result.modifiedCount} users`);
  } catch (err) {
    console.error("Error resetting daily spins:", err);
  }
});
