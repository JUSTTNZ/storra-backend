import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { UserRewards } from '../Models/rewards.model.js';
import { QuizProgress } from '../Models/quiz.model.js';
import { User } from '../Models/user.model.js';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullname, fullName, phoneNumber, parentPhoneNumber,  } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const finalFullName = (fullName || fullname || '').trim();

    // 1️⃣ Create user in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullName: finalFullName,
        phoneNumber,
        parentPhoneNumber,
     
      },
      
    });
    console.log('Creating Supabase user with:', {
  email,
  password,
  fullName: finalFullName,
  phoneNumber,
  parentPhoneNumber,
  
});

    if (error || !data.user) {
      logger.error('Supabase signup failed', { 
        message: error?.message,
        status: error?.status,
        code: error?.code,
        fullError: JSON.stringify(error, null, 2)
      });
      return res.status(400).json({ message: error?.message || 'Failed to create user' });
    }

    const supaUser = data.user;

    // Wrap MongoDB user creation in a try-catch to handle potential errors
    try {
      // 2️⃣ Initialize MongoDB profile
      let profile = await User.findOne({ supabase_user_id: supaUser.id });
      if (!profile) {
        const count = await User.countDocuments();
        const role = count === 0 ? 'superadmin' : 'user';

        profile = await User.create({
          supabase_user_id: supaUser.id,
          email: email.toLowerCase(),
          fullname: finalFullName,
          phoneNumber: phoneNumber || supaUser.user_metadata?.phoneNumber || '',
          parentPhoneNumber: parentPhoneNumber || supaUser.user_metadata?.parentPhoneNumber || '',
          role,
          isVerified: true,
          profilePictureUrl: supaUser.user_metadata?.profilePictureUrl || '',
          hasCompletedOnboarding: false,
        });

        logger.info('MongoDB profile created', { userId: profile._id, role });
      }

      // 3️⃣ Sign in to get access token
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (sessionError) {
        logger.warn('Failed to create session after signup', { error: sessionError });
        // Non-fatal, proceed without a session
      }

      // 4️⃣ Return profile + access token
      return res.status(201).json(
        new ApiResponse(201, 'User registered successfully', {
          profile,
          supabaseUser: supaUser,
          accessToken: sessionData?.session?.access_token,
        })
      );
    } catch (mongoError: any) {
      logger.error('MongoDB profile creation failed, rolling back Supabase user', {
        supabaseUserId: supaUser.id,
        error: mongoError.message,
      });

      // If MongoDB creation fails, delete the Supabase user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(supaUser.id);
      if (deleteError) {
        logger.error('Failed to delete Supabase user during rollback', {
          supabaseUserId: supaUser.id,
          error: deleteError.message,
        });
      }

      // Forward the original error to the error handler
      throw new ApiError({
        statusCode: 500,
        message: 'Registration failed due to a database error. Please try again.',
        originalError: mongoError,
      });
    }
  } catch (err: any) {
    logger.error('Registration error', { error: err.message });
    next(err);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1️⃣ Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      logger.warn('Supabase login failed', { error });
      return res.status(401).json({ message: error?.message || 'Invalid email or password' });
    }

    const supaUser = data.user;

    // 2️⃣ Fetch MongoDB profile (optional)
    let profile = await User.findOne({ supabase_user_id: supaUser.id });

    // Optional: if you want to auto-create profile (like initProfile)
    if (!profile) {
      const count = await User.countDocuments();
      const role = count === 0 ? 'superadmin' : 'user';

      profile = await User.create({
        supabase_user_id: supaUser.id,
        email: supaUser.email!.toLowerCase(),
        fullname: supaUser.user_metadata?.fullName || '',
        phoneNumber: supaUser.user_metadata?.phoneNumber || '',
        parentPhoneNumber: supaUser.user_metadata?.parentPhoneNumber || '',
        role,
        isVerified: true,
      });

      logger.info('MongoDB profile auto-created on login', { userId: profile._id });
    }

    // 3️⃣ Return access token + profile
    return res.status(200).json(
      new ApiResponse(200, 'Login successful', {
        profile,
        supabaseUser: supaUser,
        accessToken: data.session.access_token,
      })
    );
  } catch (err: any) {
    logger.error('Login error', { error: err.message });
    next(err);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supabaseUser = req.supabaseUser;

    if (!supabaseUser) {
      throw new ApiError({ statusCode: 401, message: 'Not authenticated' });
    }

    // ✅ Include all relevant onboarding + class fields
    const profile = await User.findOne({ supabase_user_id: supabaseUser.id }).select(
      'email username fullname role phoneNumber profilePictureUrl createdAt currentClassId currentClassLevel educationLevel preferredLanguage age learningGoals hasCompletedOnboarding'
    );

    if (!profile) {
      throw new ApiError({ statusCode: 404, message: 'User profile not found' });
    }

    const rewards = await UserRewards.findOne({ userId: profile._id });

    // Calculate user's total points
    const userQuizProgress = await QuizProgress.find({ userId: profile._id }).select('pointsEarned');
    const totalPoints = userQuizProgress.reduce((sum, qp) => sum + (qp.pointsEarned || 0), 0);

    // Calculate rank
    const allUsers = await User.find().select('_id');
    const allUsersPoints = await Promise.all(
      allUsers.map(async (user) => {
        const quizProgress = await QuizProgress.find({ userId: user._id }).select('pointsEarned');
        const userTotalPoints = quizProgress.reduce((sum, qp) => sum + (qp.pointsEarned || 0), 0);
        return { userId: user._id, totalPoints: userTotalPoints };
      })
    );

    const sortedUsers = allUsersPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    const rank = sortedUsers.findIndex((entry) => entry.userId.equals(profile._id)) + 1;

    logger.info('✅ Current user fetched', { userId: supabaseUser.id });

    return res
      .status(200)
      .json(new ApiResponse(200, 'User profile fetched successfully', { profile, rewards,
            spinChances: rewards?.spinChances || 0,
        leaderboard: { totalPoints, rank } }));
  } catch (err: any) {
    logger.error('Get current user error', { error: err.message });
    next(err);
  }
};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError({ statusCode: 400, message: 'Email is required' });
    }

    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) {
      logger.error('Password reset request failed', { error });
      throw new ApiError({ statusCode: 500, message: 'Failed to send password reset email' });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Password reset instructions sent to your email', {}));
  } catch (err: any) {
    logger.error('Forget password error', { error: err.message });
    next(err);
  }
};

export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supabaseUser = req.supabaseUser;

    if (!supabaseUser) {
      throw new ApiError({ statusCode: 401, message: 'Not authenticated' });
    }

    const { fullname, phoneNumber, parentPhoneNumber } = req.body;

    // 1️⃣ Update Supabase user metadata
    const { data: updatedSupaUser, error: supaError } = await supabaseAdmin.auth.admin.updateUserById(
      supabaseUser.id,
      {
        user_metadata: {
          fullName: fullname,
          phoneNumber,
          parentPhoneNumber,
        },
      }
    );

    if (supaError) {
      logger.error('Failed to update Supabase user', { error: supaError });
      throw new ApiError({ statusCode: 500, message: 'Failed to update profile' });
    }

    // 2️⃣ Update MongoDB profile
    const updatedProfile = await User.findOneAndUpdate(
      { supabase_user_id: supabaseUser.id },
      {
        $set: {
          fullname,
          phoneNumber,
          parentPhoneNumber,
        },
      },
      { new: true }
    );

    if (!updatedProfile) {
      throw new ApiError({ statusCode: 404, message: 'User profile not found' });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Profile updated successfully', updatedProfile));
  } catch (err: any) {
    logger.error('Edit profile error', { error: err.message });
    next(err);
  }
};
