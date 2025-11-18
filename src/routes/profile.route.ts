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
 *                 description: The profile picture file to upload.
 *     responses:
 *       '200':
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Profile picture uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profilePictureUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/new-avatar.png"
 *       '400':
 *         description: No file uploaded or invalid file type.
 *       '401':
 *         description: Not authenticated.
 *       '500':
 *         description: File upload failed due to server error.
 */
router.post(
  '/upload-profile',
  // requireSupabaseUser,     // Auth required
  // requireMongoProfile,     // Must load Mongo user profile
  upload.single('profile'),
  uploadProfilePicture
);

export default router;

