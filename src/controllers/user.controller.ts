import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';


export const initProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supaUser = (req as any).supabaseUser as {
      id: string;
      email: string | null;
      user_metadata?: Record<string, any>;
      app_metadata?: Record<string, any>;
    };

    if (!supaUser || !supaUser.id) {
      return res.status(400).json({ error: 'Missing Supabase user data' });
    }

    const { id, email, user_metadata, app_metadata } = supaUser;

    // From frontend body
    const { username, fullname, phoneNumber, parentPhoneNumber } = req.body as {
      username?: string;
      fullname?: string;
      phoneNumber?: string;
      parentPhoneNumber?: string;
    };

    // Try to find an existing MongoDB user
    let profile = await User.findOne({ supabase_user_id: id });

    if (!profile) {
      const count = await User.countDocuments();
      const role = count === 0 ? 'superadmin' : 'user';

      // Merge data sources: body → Supabase metadata → fallback
      const safeUsername =
        username?.trim() ||
        user_metadata?.username?.trim() ||
        (email ? email.split('@')[0] : `user_${id.slice(0, 6)}`);

      const safeFullname =
        fullname?.trim() ||
        user_metadata?.full_name?.trim() ||
        user_metadata?.fullname?.trim() ||
        user_metadata?.name?.trim() ||
        '';

      const safePhone =
        phoneNumber?.trim() ||
        user_metadata?.phone_number?.trim() ||
        user_metadata?.phoneNumber?.trim() ||
        '';

      const safeParentPhone =
        parentPhoneNumber?.trim() ||
        user_metadata?.parent_phone_number?.trim() ||
        user_metadata?.parentPhoneNumber?.trim() ||
        '';

      const isGoogleAuth =
        (app_metadata?.provider === 'google') ||
        user_metadata?.isGoogleAuth === true;

      profile = await User.create({
        supabase_user_id: id,
        email: (email || '').toLowerCase(),
        username: safeUsername.toLowerCase(),
        fullname: safeFullname,
        phoneNumber: safePhone,
        parentPhoneNumber: safeParentPhone || undefined,
        role,
        isVerified: true,
        isGoogleAuth,
      });
    } else {
      // Optionally update profile info if metadata has changed
      const updates: Record<string, any> = {};

      if (fullname && fullname !== profile.fullname) updates.fullname = fullname;
      if (phoneNumber && phoneNumber !== profile.phoneNumber) updates.phoneNumber = phoneNumber;
      if (parentPhoneNumber && parentPhoneNumber !== profile.parentPhoneNumber)
        updates.parentPhoneNumber = parentPhoneNumber;

      if (Object.keys(updates).length > 0) {
        profile = await User.findByIdAndUpdate(profile._id, updates, { new: true });
      }
    }

    res.json({ ok: true, profile });
  } catch (e) {
    console.error('Error in initProfile:', e);
    next(e);
  }
};
