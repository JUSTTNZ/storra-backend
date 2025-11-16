import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabaseClient.js';
import { User } from '../Models/user.model.js';

const router = Router();

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const BUCKET_NAME = 'avatars';

router.post('/upload-profile', upload.single('profile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.userId) return res.status(400).json({ message: 'No user ID provided' });

    const userId = req.body.userId;

    // Upload to Supabase
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    // ✅ Use MongoDB _id lookup if frontend sends Mongo ID
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
});


export default router;
