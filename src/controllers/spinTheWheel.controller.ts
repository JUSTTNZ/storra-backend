// controllers/spin.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { UserRewards } from "../Models/rewards.model.js";
import { getRandomReward, SMALL_REWARDS } from "../utils/spinTheWheel.js";

// ========================================================
// SPIN THE WHEEL
// ========================================================
export const spinTheWheel = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: "User not authenticated" });
  }

  // Load reward profile for this user

let userRewards = await UserRewards.findOne({ userId: user._id });
if (!userRewards) {
  userRewards = await UserRewards.create({
    userId: user._id,
    totalCoins: 0,
    totalPoints: 0,
    totalDiamonds: 0,
    spinChances: 1,
    trialDaysRemaining: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    dailyRewards: [],
    achievements: [],
    transactionHistory: [],
  });
}


  // -----------------------------------------
  // 1. CHECK AVAILABLE SPIN CHANCES
  // -----------------------------------------
  if (userRewards.spinChances <= 0) {
    throw new ApiError({
      statusCode: 400,
      message: "No spin chances available",
    });
  }

  // Deduct one spin immediately
  userRewards.spinChances -= 1;

  // -----------------------------------------
  // 2. COUNT PREVIOUS SPINS
  // -----------------------------------------
  const spinCount = userRewards.transactionHistory.filter(
    (t) => t.source === "spin_wheel"
  ).length;

  let reward = getRandomReward();

  // -----------------------------------------
  // 3. HARD ANTI-ABUSE LOGIC:
  //    After 10 spins → only small diamonds
  // -----------------------------------------
  if (spinCount >= 10) {
    reward = SMALL_REWARDS[Math.floor(Math.random() * SMALL_REWARDS.length)];
  }

  // -----------------------------------------
  // 4. APPLY REWARD
  // -----------------------------------------
  switch (reward.type) {
    case "diamond":
      userRewards.totalDiamonds += reward.amount!;
      break;

    case "coins":
      userRewards.totalCoins += reward.amount!;
      break;

    case "points":
      userRewards.totalPoints += reward.amount!;
      break;

    case "spin_chance":
      userRewards.spinChances += reward.amount!;
      break;

    case "item":
      // item rewards have no numeric value
      break;
  }

  // -----------------------------------------
  // 5. SAVE TRANSACTION HISTORY
  // -----------------------------------------
  userRewards.transactionHistory.push({
    type: "earn",
    rewardType: reward.type === "item" ? "diamond" : reward.type,
    amount: reward.amount ?? 0,
    source: "spin_wheel",
    description: `Won: ${reward.name}`,
    timestamp: new Date(),
  });

  await userRewards.save();

  // -----------------------------------------
  // 6. RESPONSE
  // -----------------------------------------
  return res.status(200).json(
    new ApiResponse(200, "Spin successful!", {
      reward,
      balances: {
        coins: userRewards.totalCoins,
        points: userRewards.totalPoints,
        diamonds: userRewards.totalDiamonds,
        spinChances: userRewards.spinChances,
      },
    })
  );
});
