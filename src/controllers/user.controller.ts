import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

import { supabaseAdmin } from '../lib/supabase.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
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
      email_confirm: true, // auto-confirm for testing
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
      logger.error('Supabase signup failed', { error });
      return res.status(400).json({ message: error?.message || 'Failed to create user' });
    }

    const supaUser = data.user;

    // 2️⃣ Sign in to get access token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      logger.warn('Failed to create session', { error: sessionError });
    }

    // 3️⃣ Initialize MongoDB profile
    // 3️⃣ Initialize MongoDB profile
    let profile = await User.findOne({ supabase_user_id: supaUser.id });
    if (!profile) {
      const count = await User.countDocuments();

      let role: 'superadmin' | 'admin' | 'user';
      if (count === 0) role = 'superadmin';
      else if (count === 1) role = 'admin';
      else role = 'user';

      profile = await User.create({
        supabase_user_id: supaUser.id,
        email: email.toLowerCase(),

        fullname: finalFullName,
        phoneNumber: phoneNumber || supaUser.user_metadata?.phoneNumber || '',
        parentPhoneNumber: parentPhoneNumber || supaUser.user_metadata?.parentPhoneNumber || '',
        role,
        isVerified: true,
      });

      logger.info('MongoDB profile created', { userId: profile._id, role });
    }


    // 4️⃣ Return profile + access token
    return res.status(201).json(
      new ApiResponse(201, 'User registered successfully', {
        profile,
        supabaseUser: supaUser,
        accessToken: sessionData?.session?.access_token,
      })
    );
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
        username: supaUser.user_metadata?.username || supaUser.email!.split('@')[0],
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

