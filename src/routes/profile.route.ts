import { Router } from 'express';
import multer from 'multer';
import { uploadProfilePicture } from '../controllers/profile.controller.js';
import { requireSupabaseUser, requireMongoProfile } from '../middlewares/supabaseAuth.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /profile/upload-profile:
 *   post:
 *     summary: Upload a profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: File upload failed
 */
router.post(
  '/upload-profile',
  // requireSupabaseUser,     // Auth required
  requireMongoProfile,     // Must load Mongo user profile
  upload.single('profile'),
  uploadProfilePicture
);

export default router;

