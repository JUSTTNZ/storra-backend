import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';

export interface ILessonProgress {
  lessonId: string;
  completedAt: Date;
  timeSpent?: number; // in minutes
}

export interface IQuizAttempt {
  quizId: string;
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
  attemptedAt: Date;
  timeSpent?: number; // in minutes
}

export interface ICourseProgress {
  courseId: string;
  completedLessons: ILessonProgress[];
  quizAttempts: IQuizAttempt[];
  progressPercentage: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IStudentProgress {
  userId: mongoose.Types.ObjectId;
  classId: string;
  educationLevel: 'primary' | 'junior-secondary' | 'senior-secondary';
  courseProgress: ICourseProgress[];
  overallProgress: number; // 0-100 (average of all courses)
  createdAt: Date;
  updatedAt: Date;
}

export type StudentProgressDocument = IStudentProgress & Document;

const LessonProgressSchema = new Schema({
  lessonId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 }
}, { _id: false });

const QuizAttemptSchema = new Schema({
  quizId: { type: String, required: true },
  attemptNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  attemptedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 }
}, { _id: false });

const CourseProgressSchema = new Schema({
  courseId: { type: String, required: true },
  completedLessons: [LessonProgressSchema],
  quizAttempts: [QuizAttemptSchema],
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });

const StudentProgressSchema = new Schema<StudentProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: String,
      required: true,
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['primary', 'junior-secondary', 'senior-secondary'],
      required: true,
    },
    courseProgress: [CourseProgressSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
StudentProgressSchema.index({ userId: 1, classId: 1 }, { unique: true });

export const StudentProgress =
  (mongoose.models.StudentProgress as mongoose.Model<StudentProgressDocument>) ||
  mongoose.model<StudentProgressDocument>(
    'StudentProgress',
    StudentProgressSchema
  );