import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient.js';
import { User } from '../Models/user.model.js';

const BUCKET_NAME = 'avatars';

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.userId) return res.status(400).json({ message: 'No user ID provided' });

    const userId = req.body.userId;

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePictureUrl: publicUrl },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile image uploaded successfully', url: publicUrl, user: updatedUser });
  } catch (err: any) {
    console.error('❌ Upload failed:', err.message);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};
