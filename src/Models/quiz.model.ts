// models/quizProgress.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt {
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  timeSpent: number; // in seconds
  attemptedAt: Date;
}

export interface IQuizProgress {
  userId: mongoose.Types.ObjectId;
  classId: string;
  courseId: string;
  quizId: string;
  status: 'new' | 'incomplete' | 'complete';
  attempts: IQuizAttempt[];
  bestScore: number;
  bestPercentage: number;
  pointsEarned: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type QuizProgressDocument = IQuizProgress & Document;

const QuizAttemptSchema = new Schema({
  attemptNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [
    {
      questionId: { type: String, required: true },
      selectedAnswer: { type: String, required: true },
      correctAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  timeSpent: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now },
}, { _id: false });

const QuizProgressSchema = new Schema<QuizProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    quizId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'incomplete', 'complete'],
      default: 'new',
      index: true,
    },
    attempts: [QuizAttemptSchema],
    bestScore: {
      type: Number,
      default: 0,
    },
    bestPercentage: {
      type: Number,
      default: 0,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
QuizProgressSchema.index({ userId: 1, quizId: 1 }, { unique: true });
QuizProgressSchema.index({ userId: 1, courseId: 1 });
QuizProgressSchema.index({ userId: 1, status: 1 });

export const QuizProgress = mongoose.model<QuizProgressDocument>(
  'QuizProgress',
  QuizProgressSchema
);

// ============= USER LEADERBOARD MODEL =============
export interface IUserLeaderboard {
  userId: mongoose.Types.ObjectId;
  totalPoints: number;
  quizzesCompleted: number;
  perfectScores: number; // Count of 100% scores
  classId: string;
  educationLevel: string;
  rank?: number; // Will be calculated dynamically
  createdAt: Date;
  updatedAt: Date;
}

export type UserLeaderboardDocument = IUserLeaderboard & Document;

const UserLeaderboardSchema = new Schema<UserLeaderboardDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      index: true, // For sorting leaderboard
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
    },
    perfectScores: {
      type: Number,
      default: 0,
    },
    classId: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for class-specific leaderboards
UserLeaderboardSchema.index({ classId: 1, totalPoints: -1 });
UserLeaderboardSchema.index({ educationLevel: 1, totalPoints: -1 });

export const UserLeaderboard = mongoose.model<UserLeaderboardDocument>(
  'UserLeaderboard',
  UserLeaderboardSchema
);