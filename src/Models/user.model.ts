import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';

// ============= USER MODEL =============
export interface IUser {
  supabase_user_id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'user' | 'admin' | 'superadmin';
  phoneNumber: string;
  parentPhoneNumber?: string;
  isVerified: boolean;
  isGoogleAuth?: boolean;
  primaryStudents: mongoose.Types.ObjectId[];
  secondaryStudents: mongoose.Types.ObjectId[];
  tertiaryStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    supabase_user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: false, // Fixed typo: "optional" -> false
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: 'Please provide a valid email address',
      },
    },
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?\d{7,15}$/, 'Invalid phone number format'],
    },
    parentPhoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{7,15}$/, 'Invalid parent phone number format'],
    },
    isVerified: { type: Boolean, default: true },
    isGoogleAuth: { type: Boolean, default: false },
    
    // Student references by education level
    primaryStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'Student'
    }],
    secondaryStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'Student'
    }],
    tertiaryStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'Student'
    }],
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);

// ============= STUDENT MODEL =============
export interface IStudent {
  userId: mongoose.Types.ObjectId; // Reference to parent user
  studentName: string;
  educationLevel: 'primary' | 'secondary' | 'tertiary';
  className: string; // e.g., "Grade 5", "Form 3", "Year 2"
  courses: mongoose.Types.ObjectId[]; // References to Course model
  enrollmentDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StudentDocument = IStudent & Document;

const StudentSchema = new Schema<StudentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    educationLevel: {
      type: String,
      enum: ['primary', 'secondary', 'tertiary'],
      required: [true, 'Education level is required'],
      index: true,
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      index: true,
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
StudentSchema.index({ userId: 1, educationLevel: 1 });

export const Student = mongoose.model<StudentDocument>('Student', StudentSchema);

// // ============= COURSE MODEL =============
// export interface ICourse {
//   courseName: string;
//   courseCode: string;
//   educationLevel: 'primary' | 'secondary' | 'tertiary';
//   className: string; // Which class this course belongs to
//   description?: string;
//   credits?: number; // For tertiary level
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export type CourseDocument = ICourse & Document;

// const CourseSchema = new Schema<CourseDocument>(
//   {
//     courseName: {
//       type: String,
//       required: [true, 'Course name is required'],
//       trim: true,
//     },
//     courseCode: {
//       type: String,
//       required: [true, 'Course code is required'],
//       unique: true,
//       uppercase: true,
//       trim: true,
//       index: true,
//     },
//     educationLevel: {
//       type: String,
//       enum: ['primary', 'secondary', 'tertiary'],
//       required: true,
//       index: true,
//     },
//     className: {
//       type: String,
//       required: [true, 'Class name is required'],
//       trim: true,
//       index: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     credits: {
//       type: Number,
//       min: 0,
//       max: 10,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// // Compound index for efficient queries
// CourseSchema.index({ educationLevel: 1, className: 1 });

// export const Course = mongoose.model<CourseDocument>('Course', CourseSchema);