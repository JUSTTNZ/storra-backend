import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';

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
  
  // Class enrollment info
  currentClassId?: string; // e.g., "jss-1", "primary-1"
  educationLevel?: 'primary' | 'junior-secondary' | 'senior-secondary';
  
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
      required: false,
      unique: true,
      sparse: true,
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
    
    // Current class enrollment
    currentClassId: {
      type: String,
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['primary', 'junior-secondary', 'senior-secondary'],
      index: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);