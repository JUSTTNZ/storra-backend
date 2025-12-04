import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';

export interface ILesson {
  lessonId: string;
  lessonTitle: string;
  lessonType: 'text' | 'video' | 'audio';
  description: string;
  textContent?: string;
  videoUrl?: string;
  audioUrl?: string;
  visual?: string[]; // ADDED: Visual images array
}

export interface IQuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  visual?: string[]; // ADDED: Visual images array
}

export interface IQuiz {
  quizId: string;
  quizTitle: string;
  quizImage?: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: string;
  questions: IQuizQuestion[];
}

export interface ICourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  description: string;
  courseImage?: string;
  lessons: ILesson[];
  quiz: IQuiz;
}

export interface IClass {
  classId: string;
  className: string;
  educationLevel: 'primary' | 'junior-secondary' | 'senior-secondary';
  courses: ICourse[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ClassDocument = IClass & Document;

const LessonSchema = new Schema({
  lessonId: { type: String, required: true },
  lessonTitle: { type: String, required: true },
  lessonType: { 
    type: String, 
    enum: ['text', 'video', 'audio'], 
    required: true 
  },
  description: { type: String },
  textContent: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  visual: [{ type: String }] // ADDED: Visual images array
}, { _id: false });

const QuizQuestionSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  visual: [{ type: String }] // ADDED: Visual images array
}, { _id: false });

const QuizSchema = new Schema({
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  quizImage: { type: String },
  totalQuestions: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  timeLimit: { type: String, required: true },
  questions: [QuizQuestionSchema]
}, { _id: false });

const CourseSchema = new Schema({
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  description: { type: String, required: true },
  courseImage: { type: String },
  lessons: [LessonSchema],
  quiz: QuizSchema
}, { _id: false });

const ClassSchema = new Schema<ClassDocument>(
  {
    classId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    educationLevel: {
      type: String,
      enum: ['primary', 'junior-secondary', 'senior-secondary'],
      required: true,
      index: true,
    },
    courses: [CourseSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Class =
  (mongoose.models.Class as mongoose.Model<ClassDocument>) ||
  mongoose.model<ClassDocument>('Class', ClassSchema);