// models/user.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';

export interface IUser {
  supabase_user_id: string;
  email: string;
  fullname: string;
  profilePictureUrl?: string;
  role: 'user' | 'admin' | 'superadmin';
  phoneNumber: string;
  parentPhoneNumber?: string;
  isVerified: boolean;
  isGoogleAuth?: boolean;
  
  // Onboarding/Personalization fields
  age?: number;
  currentClassLevel?: 'primary' | 'secondary';
  preferredLanguage?: string;
  learningGoals?: string[];
  learningDaysPerWeek?: string;
  learningTimePerDay?: string;
  
  // Specific class enrollment (for primary & secondary)
  currentClassId?: string; // e.g., "primary-1", "jss-1", "sss-3"
  educationLevel?: 'primary' | 'junior-secondary' | 'senior-secondary';
  
  // Onboarding status
  hasCompletedOnboarding: boolean;
  
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
    profilePictureUrl: {
      type: String,
      trim: true,
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
    
    // Onboarding fields
    age: {
      type: Number,
      min: 1,
      max: 150,
    },
    currentClassLevel: {
      type: String,
      enum: ['primary', 'secondary'],
      index: true,
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    learningGoals: [{
      type: String,
      trim: true,
    }],
    learningDaysPerWeek: {
      type: String,
    },
    learningTimePerDay: {
      type: String,
    },
    
    // Specific class enrollment (for primary & secondary)
    currentClassId: {
      type: String,
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['primary', 'junior-secondary', 'senior-secondary'],
      index: true,
    },
    
    // Onboarding status
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const User =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema);