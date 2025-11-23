// controllers/dailyReward.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserRewards, getRewardForCycleDay, cycleRewards } from "../Models/rewards.model.js";

/**
 * POST /daily/claim
 * Claim today's reward in the 7-day cycle
 */
export const claimDailyLoginReward = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new ApiError({ statusCode: 401, message: "Unauthorized" });

  let rewards = await UserRewards.findOne({ userId: user._id });

  // create default profile if none
  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalDiamonds: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      currentCycleDay: 1,
      cycleHistory: [],
      transactionHistory: [],
    });
  }

  const now = new Date();
  const last = rewards.lastLoginDate ? new Date(rewards.lastLoginDate) : null;

  // Prevent multiple claims in the same day
  const isSameDay = last && now.toDateString() === last.toDateString();
  if (isSameDay) {
    throw new ApiError({ statusCode: 400, message: "You already claimed today's reward" });
  }

  // Update streak
  let newStreak = 1;
  if (last) {
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) newStreak = rewards.currentStreak + 1;
    else if (diff > 1) newStreak = 1;
  }

  // Determine today's cycle reward
  const todayCycleDay = rewards.currentCycleDay;
  const reward = getRewardForCycleDay(todayCycleDay);

  // Apply reward
  switch (reward.type) {
    case "coins":
      rewards.totalCoins += reward.amount;
      break;
    case "diamond":
      rewards.totalDiamonds += reward.amount;
      break;
  }

  // Record history
  rewards.cycleHistory.push({
    day: todayCycleDay,
    reward,
    claimedAt: now,
  });

  rewards.transactionHistory.push({
    type: "earn",
    rewardType: reward.type,
    amount: reward.amount,
    source: "daily_cycle",
    description: reward.description,
    timestamp: now,
  });

  // Move to next cycle day
  rewards.currentCycleDay = todayCycleDay === 7 ? 1 : todayCycleDay + 1;

  rewards.currentStreak = newStreak;
  if (newStreak > rewards.longestStreak) rewards.longestStreak = newStreak;

  rewards.lastLoginDate = now;

  await rewards.save();

  res.status(200).json(
    new ApiResponse(200, "Reward claimed", {
      reward,
      cycleDay: todayCycleDay,
      nextCycleDay: rewards.currentCycleDay,
      streak: rewards.currentStreak,
      balance: {
        coins: rewards.totalCoins,
        diamonds: rewards.totalDiamonds,
      },
    })
  );
});

/**
 * GET /daily/info
 * Get 7-day cycle info + today's claim status
 */
export const getDailyRewardInfo = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new ApiError({ statusCode: 401, message: "Unauthorized" });

  let rewards = await UserRewards.findOne({ userId: user._id });

  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalDiamonds: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      currentCycleDay: 1,
      cycleHistory: [],
      transactionHistory: [],
    });
  }

  const now = new Date();
  const last = rewards.lastLoginDate ? new Date(rewards.lastLoginDate) : null;
  const claimedToday = last && now.toDateString() === last.toDateString();

  // Build cycle info for frontend
  const cycle = cycleRewards.map((reward, index) => ({
    day: index + 1,
    reward,
    claimed: rewards.cycleHistory.some((c) => c.day === index + 1),
    isToday: rewards.currentCycleDay === index + 1,
  }));

  res.status(200).json(
    new ApiResponse(200, "Daily info fetched", {
      cycleDay: rewards.currentCycleDay,
      claimedToday,
      streak: rewards.currentStreak,
      cycle,
      balance: {
        coins: rewards.totalCoins,
        diamonds: rewards.totalDiamonds,
      },
    })
  );
});
