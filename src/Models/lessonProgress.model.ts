
import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  lastAccessedAt: Date;
  completedAt?: Date;
  videoWatchPercentage?: number;
  audioListenPercentage?: number;
  textReadPercentage?: number;
  isBookmarked: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  markAsCompleted(): Promise<this>;
  updateProgress(progressValue: number): Promise<this>;
}

export type LessonProgressDocument = ILessonProgress & Document;

const LessonProgressSchema = new Schema<LessonProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    videoWatchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    audioListenPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    textReadPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
LessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ userId: 1, status: 1 });
LessonProgressSchema.index({ userId: 1, courseId: 1 });

// Methods
LessonProgressSchema.methods.markAsCompleted = function(this: ILessonProgress) {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

LessonProgressSchema.methods.updateProgress = function(this: ILessonProgress, progressValue: number) {
  this.progress = Math.min(100, Math.max(0, progressValue));
  this.lastAccessedAt = new Date();
  
  if (this.progress === 0) {
    this.status = 'not_started';
  } else if (this.progress === 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else {
    this.status = 'in_progress';
  }
  
  return this.save();
};

export const LessonProgress =
  (mongoose.models.LessonProgress as mongoose.Model<LessonProgressDocument>) ||
  mongoose.model<LessonProgressDocument>('LessonProgress', LessonProgressSchema);
