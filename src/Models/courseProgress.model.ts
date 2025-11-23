
import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  courseName: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  status: 'not_started' | 'in_progress' | 'completed';
  totalTimeSpent: number;
  lastAccessedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  quizCompleted: boolean;
  quizScore?: number;
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  
  updateOverallProgress(): Promise<this>;
}

export type CourseProgressDocument = ICourseProgress & Document;

const CourseProgressSchema = new Schema<CourseProgressDocument>(
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
    courseName: {
      type: String,
      required: true,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLessons: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      index: true,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    quizCompleted: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CourseProgressSchema.index({ userId: 1, status: 1 });

// Methods
CourseProgressSchema.methods.updateOverallProgress = function(this: ICourseProgress) {
  if (this.totalLessons > 0) {
    this.overallProgress = Math.round((this.completedLessons / this.totalLessons) * 100);
    
    if (this.overallProgress === 0) {
      this.status = 'not_started';
    } else if (this.overallProgress === 100 && this.quizCompleted) {
      this.status = 'completed';
      this.completedAt = new Date();
    } else {
      this.status = 'in_progress';
      if (!this.startedAt) {
        this.startedAt = new Date();
      }
    }
  }
  return this.save();
};

export const CourseProgress =
  (mongoose.models.CourseProgress as mongoose.Model<CourseProgressDocument>) ||
  mongoose.model<CourseProgressDocument>('CourseProgress', CourseProgressSchema);
