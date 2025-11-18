// controllers/reward.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { UserRewards, getDailyRewardForDay, PREDEFINED_ACHIEVEMENTS } from '../Models/rewards.model.js';
import mongoose from 'mongoose';

// ============================================
// GET USER REWARDS (Dashboard)
// ============================================
export const getUserRewards = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  let rewards = await UserRewards.findOne({ userId: user._id });

  // Create rewards if doesn't exist
  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalPoints: 0,
      spinChances: 0,
      trialDaysRemaining: 0,
      currentStreak: 0,
      longestStreak: 0,
      dailyRewards: [],
      achievements: PREDEFINED_ACHIEVEMENTS.map(a => ({
        ...a,
        claimed: false,
      })),
      transactionHistory: [],
    });
  }

  return res.status(200).json(
    new ApiResponse(200, 'Rewards fetched successfully', rewards)
  );
});

// ============================================
// CLAIM DAILY LOGIN REWARD
// ============================================
export const claimDailyReward = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  let rewards = await UserRewards.findOne({ userId: user._id });

  if (!rewards) {
    rewards = await UserRewards.create({
      userId: user._id,
      totalCoins: 0,
      totalPoints: 0,
      spinChances: 0,
      trialDaysRemaining: 0,
      currentStreak: 0,
      longestStreak: 0,
      dailyRewards: [],
      achievements: PREDEFINED_ACHIEVEMENTS.map(a => ({ ...a, claimed: false })),
      transactionHistory: [],
    });
  }

  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Check if already claimed today
  const alreadyClaimed = rewards.dailyRewards.find(
    dr => dr.day === today && dr.month === currentMonth && dr.year === currentYear && dr.claimed
  );

  if (alreadyClaimed) {
    throw new ApiError({ statusCode: 400, message: 'Daily reward already claimed today' });
  }

  // Calculate streak
  const lastLogin = rewards.lastLoginDate;
  let newStreak = 1;

  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    const daysDiff = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      newStreak = rewards.currentStreak + 1;
    } else if (daysDiff === 0) {
      // Same day (already checked above, but just in case)
      newStreak = rewards.currentStreak;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  // Get reward for today
  const dailyRewardData = getDailyRewardForDay(today);

  // Apply rewards
  for (const reward of dailyRewardData) {
    switch (reward.type) {
      case 'coins':
        rewards.totalCoins += reward.amount;
        break;
      case 'points':
        rewards.totalPoints += reward.amount;
        break;
      case 'spin_chance':
        rewards.spinChances += reward.amount;
        break;
      case 'trial_access':
        rewards.trialDaysRemaining += reward.amount;
        break;
    }

    // Add to transaction history
    rewards.transactionHistory.push({
      type: 'earn',
      rewardType: reward.type,
      amount: reward.amount,
      source: 'daily_login',
      description: reward.description,
      timestamp: now,
    });
  }

  // Update daily rewards
  rewards.dailyRewards.push({
    day: today,
    month: currentMonth,
    year: currentYear,
    rewards: dailyRewardData,
    claimed: true,
    claimedAt: now,
  });

  // Update streak
  rewards.currentStreak = newStreak;
  if (newStreak > rewards.longestStreak) {
    rewards.longestStreak = newStreak;
  }
  rewards.lastLoginDate = now;

  // Check for streak achievements
  await checkAndUnlockAchievements(rewards, user._id);

  await rewards.save();

  return res.status(200).json(
    new ApiResponse(200, 'Daily reward claimed successfully', {
      rewards: dailyRewardData,
      newBalance: {
        coins: rewards.totalCoins,
        points: rewards.totalPoints,
        spinChances: rewards.spinChances,
        trialDays: rewards.trialDaysRemaining,
      },
      streak: rewards.currentStreak,
    })
  );
});

// ============================================
// CLAIM ACHIEVEMENT REWARD
// ============================================
export const claimAchievement = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { achievementId } = req.params;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  const rewards = await UserRewards.findOne({ userId: user._id });

  if (!rewards) {
    throw new ApiError({ statusCode: 404, message: 'Rewards not found' });
  }

  const achievement = rewards.achievements.find(a => a.achievementId === achievementId);

  if (!achievement) {
    throw new ApiError({ statusCode: 404, message: 'Achievement not found' });
  }

  if (!achievement.unlockedAt) {
    throw new ApiError({ statusCode: 400, message: 'Achievement not unlocked yet' });
  }

  if (achievement.claimed) {
    throw new ApiError({ statusCode: 400, message: 'Achievement already claimed' });
  }

  // Apply reward
  switch (achievement.rewardType) {
    case 'coins':
      rewards.totalCoins += achievement.rewardAmount;
      break;
    case 'points':
      rewards.totalPoints += achievement.rewardAmount;
      break;
    case 'spin_chance':
      rewards.spinChances += achievement.rewardAmount;
      break;
    case 'trial_access':
      rewards.trialDaysRemaining += achievement.rewardAmount;
      break;
  }

  // Mark as claimed
  achievement.claimed = true;
  achievement.claimedAt = new Date();

  // Add to transaction history
  rewards.transactionHistory.push({
    type: 'earn',
    rewardType: achievement.rewardType,
    amount: achievement.rewardAmount,
    source: 'achievement',
    description: achievement.title,
    timestamp: new Date(),
  });

  await rewards.save();

  return res.status(200).json(
    new ApiResponse(200, 'Achievement claimed successfully', {
      achievement,
      newBalance: {
        coins: rewards.totalCoins,
        points: rewards.totalPoints,
        spinChances: rewards.spinChances,
        trialDays: rewards.trialDaysRemaining,
      },
    })
  );
});

// ============================================
// GET DAILY REWARDS CALENDAR
// ============================================
export const getDailyRewardsCalendar = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new ApiError({ statusCode: 401, message: 'User not authenticated' });
  }

  const rewards = await UserRewards.findOne({ userId: user._id });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Generate calendar for current month
  const calendar = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const claimed = rewards?.dailyRewards.find(
      dr => dr.day === day && dr.month === currentMonth && dr.year === currentYear
    );

    calendar.push({
      day,
      rewards: getDailyRewardForDay(day),
      claimed: !!claimed,
      claimedAt: claimed?.claimedAt,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, 'Daily rewards calendar fetched', {
      month: currentMonth,
      year: currentYear,
      calendar,
      currentStreak: rewards?.currentStreak || 0,
    })
  );
});

// ============================================
// HELPER: Check and Unlock Achievements
// =-==========================================
async function checkAndUnlockAchievements(rewards: any, userId: mongoose.Types.ObjectId) {
  const now = new Date();

  // Check streak achievements
  if (rewards.currentStreak === 7) {
    const achievement = rewards.achievements.find((a: any) => a.achievementId === '7_day_streak');
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = now;
    }
  }

  if (rewards.currentStreak === 30) {
    const achievement = rewards.achievements.find((a: any) => a.achievementId === '30_day_streak');
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = now;
    }
  }

  // Note: Other achievements (quiz completion, course completion) 
  // should be unlocked from their respective controllers
}

// ============================================
// UNLOCK ACHIEVEMENT (Called from other controllers)
// ============================================
export const unlockAchievement = async (userId: mongoose.Types.ObjectId, achievementId: string) => {
  const rewards = await UserRewards.findOne({ userId });

  if (!rewards) return;

  const achievement = rewards.achievements.find(a => a.achievementId === achievementId);

  if (achievement && !achievement.unlockedAt) {
    achievement.unlockedAt = new Date();
    await rewards.save();
  }
};

export { unlockAchievement as unlockAchievementHelper };
