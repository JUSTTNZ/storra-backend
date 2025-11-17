import { Router } from 'express';
import multer from 'multer';
import { uploadProfilePicture } from '../controllers/profile.controller.js';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/upload-profile',
  requireSupabaseUser,     // Auth required
  requireMongoProfile,     // Must load Mongo user profile
  upload.single('profile'),
  uploadProfilePicture
);

export default router;

