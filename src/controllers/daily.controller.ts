// controllers/dailyReward.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserRewards, getDailyRewardForDay } from "../Models/rewards.model.js";

/**
 * POST /daily/claim
 * Claim today's daily login reward
 */
export const claimDailyLoginReward = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError({ statusCode: 401, message: "User not authenticated" });
  }

  let rewards = await UserRewards.findOne({ userId: user._id });

  // Create default reward doc if missing
  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalPoints: 0,
      totalDiamonds: 0,
      spinChances: 0,
      trialDaysRemaining: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      dailyRewards: [],
      achievements: [],
      transactionHistory: [],
    });
  }

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Check if already claimed today
  const claimedToday = rewards.dailyRewards.find(
    (r) => r.day === today && r.month === month && r.year === year && r.claimed
  );

  if (claimedToday) {
    throw new ApiError({ statusCode: 400, message: "You already claimed today's reward" });
  }

  // ----------- STREAK LOGIC -----------
  let newStreak = 1;
  const lastLogin = rewards.lastLoginDate;
  if (lastLogin) {
    const diffDays = Math.floor((now.getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) newStreak = rewards.currentStreak + 1;
    else if (diffDays > 1) newStreak = 1;
    else newStreak = rewards.currentStreak;
  }

  // ----------- DAILY REWARD CONTENT -----------
  const rewardList = getDailyRewardForDay(today);

  rewardList.forEach((reward) => {
    switch (reward.type) {
      case "coins": rewards.totalCoins += reward.amount; break;
      case "points": rewards.totalPoints += reward.amount; break;
      case "spin_chance": rewards.spinChances += reward.amount; break;
      case "trial_access": rewards.trialDaysRemaining += reward.amount; break;
      case "diamond": rewards.totalDiamonds += reward.amount; break;
    }
    rewards.transactionHistory.push({
      type: "earn",
      rewardType: reward.type,
      amount: reward.amount,
      source: "daily_login",
      description: reward.description,
      timestamp: now,
    });
  });

  rewards.dailyRewards.push({ day: today, month, year, rewards: rewardList, claimed: true, claimedAt: now });

  rewards.currentStreak = newStreak;
  if (newStreak > rewards.longestStreak) rewards.longestStreak = newStreak;
  rewards.lastLoginDate = now;

  await rewards.save();

  res.status(200).json(new ApiResponse(200, "Daily reward claimed successfully", {
    rewards: rewardList,
    streak: rewards.currentStreak,
    newBalance: {
      coins: rewards.totalCoins,
      points: rewards.totalPoints,
      diamonds: rewards.totalDiamonds,
      spinChances: rewards.spinChances,
      trialDaysRemaining: rewards.trialDaysRemaining,
    },
  }));
});

/**
 * GET /daily/info
 * Get info about daily reward: claimed today, streak, balances
 */
export const getDailyRewardInfo = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError({ statusCode: 401, message: "User not authenticated" });
  }

  let rewards = await UserRewards.findOne({ userId: user._id });

  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalPoints: 0,
      totalDiamonds: 0,
      spinChances: 0,
      trialDaysRemaining: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      dailyRewards: [],
      achievements: [],
      transactionHistory: [],
    });
  }

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const claimedToday = rewards.dailyRewards.some(
    (r) => r.day === today && r.month === month && r.year === year && r.claimed
  );

  res.status(200).json(new ApiResponse(200, "Daily reward info fetched", {
    claimedToday,
    streak: rewards.currentStreak,
    longestStreak: rewards.longestStreak,
    balance: {
      coins: rewards.totalCoins,
      points: rewards.totalPoints,
      diamonds: rewards.totalDiamonds,
      spinChances: rewards.spinChances,
      trialDaysRemaining: rewards.trialDaysRemaining,
    },
  }));
});
