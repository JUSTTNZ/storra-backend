// models/reward.model.ts
import mongoose, { Schema, Document } from 'mongoose';

/* ===========================================
   UPDATED REWARD TYPES (ADDED "diamond")
=========================================== */
export type RewardType =
  | 'coins'
  | 'points'
  | 'spin_chance'
  | 'trial_access'
  | 'diamond'; // NEW — Diamonds currency

export interface IReward {
  type: RewardType;
  amount: number;
  description: string;
}

/* ===========================================
   DAILY LOGIN REWARD MODEL
=========================================== */
export interface IDailyLoginReward {
  day: number;
  month: number;
  year: number;
  rewards: IReward[];
  claimed: boolean;
  claimedAt?: Date;
}

/* ===========================================
   ACHIEVEMENTS MODEL
=========================================== */
export interface IAchievement {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  rewardType: RewardType;
  rewardAmount: number;
  condition: string;
  unlockedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
}

/* ===========================================
   USER REWARDS MODEL
=========================================== */
export interface IUserRewards {
  userId: mongoose.Types.ObjectId;

  /* Balances */
  totalCoins: number;
  totalPoints: number;
  totalDiamonds: number; // NEW
  spinChances: number;
  trialDaysRemaining: number;

  /* Daily Login Tracking */
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Date;
  dailyRewards: IDailyLoginReward[];

  /* Achievements */
  achievements: IAchievement[];

  /* Transaction History */
  transactionHistory: Array<{
    type: 'earn' | 'spend';
    rewardType: RewardType;
    amount: number;
    source: string;
    description: string;
    timestamp: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

export type UserRewardsDocument = IUserRewards & Document;

/* ===========================================
   SUBSCHEMAS
=========================================== */

const RewardSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['coins', 'points', 'spin_chance', 'trial_access', 'diamond'],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const DailyLoginRewardSchema = new Schema(
  {
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    rewards: [RewardSchema],
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
  },
  { _id: false }
);

const AchievementSchema = new Schema(
  {
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    rewardType: {
      type: String,
      enum: ['coins', 'points', 'spin_chance', 'trial_access', 'diamond'],
      required: true,
    },
    rewardAmount: { type: Number, required: true },
    condition: { type: String, required: true },
    unlockedAt: { type: Date },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
  },
  { _id: false }
);

/* ===========================================
   MAIN USER REWARDS SCHEMA
=========================================== */

const UserRewardsSchema = new Schema<UserRewardsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /* Balances */
    totalCoins: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalDiamonds: { type: Number, default: 0 }, // NEW
    spinChances: { type: Number, default: 0 },
    trialDaysRemaining: { type: Number, default: 0 },

    /* Daily Login Tracking */
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    dailyRewards: [DailyLoginRewardSchema],

    /* Achievements */
    achievements: [AchievementSchema],

    /* Transaction History */
    transactionHistory: [
      {
        type: {
          type: String,
          enum: ['earn', 'spend'],
          required: true,
        },
        rewardType: {
          type: String,
          enum: ['coins', 'points', 'spin_chance', 'trial_access', 'diamond'], // UPDATED
          required: true,
        },
        amount: { type: Number, required: true },
        source: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index optimization
UserRewardsSchema.index({
  'dailyRewards.day': 1,
  'dailyRewards.month': 1,
  'dailyRewards.year': 1,
});

export const UserRewards = mongoose.model<UserRewardsDocument>(
  'UserRewards',
  UserRewardsSchema
);

/* ===========================================
   PREDEFINED ACHIEVEMENTS (UNCHANGED)
=========================================== */

export const PREDEFINED_ACHIEVEMENTS = [
  {
    achievementId: 'first_login',
    title: 'Welcome Aboard!',
    description: 'Complete your first login',
    icon: 'hand-left-outline',
    color: 'bg-blue-50',
    rewardType: 'coins',
    rewardAmount: 50,
    condition: 'first_login',
  },
  {
    achievementId: 'first_course_completed',
    title: 'First Course Completed',
    description: 'Complete your first course',
    icon: 'school-outline',
    color: 'bg-green-50',
    rewardType: 'points',
    rewardAmount: 100,
    condition: 'complete_first_course',
  },
  {
    achievementId: 'perfect_quiz_score',
    title: 'Perfect Quiz Score',
    description: 'Score 100% on any quiz',
    icon: 'ribbon-outline',
    color: 'bg-purple-50',
    rewardType: 'coins',
    rewardAmount: 200,
    condition: 'perfect_quiz_score',
  },
  {
    achievementId: '7_day_streak',
    title: '7-Day Streak Achieved',
    description: 'Login for 7 consecutive days',
    icon: 'flame-outline',
    color: 'bg-yellow-50',
    rewardType: 'spin_chance',
    rewardAmount: 1,
    condition: 'streak_7',
  },
  {
    achievementId: '30_day_streak',
    title: '30-Day Streak Master',
    description: 'Login for 30 consecutive days',
    icon: 'trophy-outline',
    color: 'bg-red-50',
    rewardType: 'trial_access',
    rewardAmount: 7,
    condition: 'streak_30',
  },
  {
    achievementId: '10_quizzes_completed',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: 'checkbox-outline',
    color: 'bg-indigo-50',
    rewardType: 'points',
    rewardAmount: 500,
    condition: 'complete_10_quizzes',
  },
];

/* ===========================================
   DAILY REWARD SCHEDULE (UNCHANGED)
=========================================== */
export const getDailyRewardForDay = (day: number): IReward[] => {
  if (day <= 6) {
    return [
      { type: 'coins', amount: 10 * day, description: `Day ${day} login bonus` },
    ];
  }

  if (day === 7) {
    return [
      { type: 'coins', amount: 100, description: 'Week 1 completion bonus' },
      { type: 'spin_chance', amount: 1, description: 'Free spin!' },
    ];
  }

  if (day <= 13) {
    return [
      { type: 'coins', amount: 15 * (day - 7), description: `Day ${day} login bonus` },
    ];
  }

  if (day === 14) {
    return [
      { type: 'coins', amount: 150, description: 'Week 2 completion bonus' },
      { type: 'points', amount: 50, description: 'Bonus points!' },
    ];
  }

  if (day <= 20) {
    return [
      { type: 'coins', amount: 20 * (day - 14), description: `Day ${day} login bonus` },
    ];
  }

  if (day === 21) {
    return [
      { type: 'coins', amount: 200, description: 'Week 3 completion bonus' },
      { type: 'spin_chance', amount: 2, description: 'Double spin!' },
    ];
  }

  if (day <= 27) {
    return [
      { type: 'coins', amount: 25 * (day - 21), description: `Day ${day} login bonus` },
      { type: 'points', amount: 10 * (day - 21), description: 'Daily points' },
    ];
  }

  if (day <= 30) {
    return [
      { type: 'coins', amount: 50 * (day - 27), description: `Day ${day} mega bonus` },
      { type: 'points', amount: 25 * (day - 27), description: 'Mega points' },
      { type: 'spin_chance', amount: 1, description: 'Daily spin' },
    ];
  }

  return [];
};
