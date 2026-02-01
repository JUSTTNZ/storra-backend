// controllers/spin.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { UserRewards } from "../Models/rewards.model.js";
import { SPIN_REWARDS, getRandomReward, SMALL_REWARDS } from "../utils/spinTheWheel.js";

// ========================================================
// 1️⃣ GET WHEEL PREVIEW (COMMON REWARDS ONLY)
// ========================================================
// ========================================================
// 1️⃣ GET WHEEL PREVIEW (COMMON + 1 MYSTERY)
// ========================================================
// controllers/spin.controller.ts
export const getWheelPreview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: "User not authenticated" });
  }

  // 1️⃣ Get 3 common coin rewards
  const coinRewards = SPIN_REWARDS.filter(r => r.type === "coins").slice(0, 3);

  // 2️⃣ Free spin reward
  const freeSpinReward = SPIN_REWARDS.find(r => r.type === "spin_chance");

  // 3️⃣ Mystery reward: pick randomly from diamonds or items
  const mysteryPool = SPIN_REWARDS.filter(r => r.type === "diamond" || r.type === "item");
  const mysteryReward = mysteryPool[Math.floor(Math.random() * mysteryPool.length)];

  // 4️⃣ Combine for preview
  const previewRewards = [
    ...coinRewards,
    freeSpinReward!,
    mysteryReward
  ].map(r => ({
    name: r.name,
    type: r.type,
  }));

  // 5️⃣ Get user's current spin chances
  let spinChances = 3;
  const userRewards = await UserRewards.findOne({ userId: user._id });
  if (userRewards) {
    const today = new Date();
    const lastSpinReset = userRewards.lastSpinResetDate;
    // If no reset today yet, they'll get 3 when they spin
    if (!lastSpinReset || lastSpinReset.toDateString() !== today.toDateString()) {
      spinChances = 3;
    } else {
      spinChances = userRewards.spinChances;
    }
  }

  return res.status(200).json({
    status: 200,
    message: "Wheel preview rewards",
    data: previewRewards,
    spinChances,
  });
});


// ========================================================
// 2️⃣ SPIN THE WHEEL
// ========================================================
export const spinTheWheel = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: "User not authenticated" });
  }

  // Load user rewards
  let userRewards = await UserRewards.findOne({ userId: user._id });
  if (!userRewards) {
    userRewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalPoints: 0,
      totalDiamonds: 0,
      spinChances: 3, // start with 3 spins
      trialDaysRemaining: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      dailyRewards: [],
      achievements: [],
      transactionHistory: [],
    });
  }

  // ------------------------------
  // Reset spins if last spin reset was on a previous day
  // ------------------------------
  const today = new Date();
  const lastSpinReset = userRewards.lastSpinResetDate;
  if (!lastSpinReset || lastSpinReset.toDateString() !== today.toDateString()) {
    userRewards.spinChances = 3; // reset spins for the day
    userRewards.lastSpinResetDate = today;
  }

  // ------------------------------
  // Check spins available
  // ------------------------------
  if (userRewards.spinChances <= 0) {
    throw new ApiError({
      statusCode: 400,
      message: "No spin chances available for today",
    });
  }

  // Deduct spin
  userRewards.spinChances -= 1;

  // Count previous spins (for anti-abuse)
  const spinCount = userRewards.transactionHistory.filter(
    (t) => t.source === "spin_wheel"
  ).length;

  // Pick reward
  let reward = getRandomReward();
  if (spinCount >= 10) {
    reward = SMALL_REWARDS[Math.floor(Math.random() * SMALL_REWARDS.length)];
  }

  // Apply reward
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
      break; // no numeric effect
  }

  // Save transaction
  userRewards.transactionHistory.push({
    type: "earn",
    rewardType: reward.type === "item" ? "diamond" : reward.type,
    amount: reward.amount ?? 0,
    source: "spin_wheel",
    description: `Won: ${reward.name}`,
    timestamp: new Date(),
  });

  await userRewards.save();

  // Respond
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
