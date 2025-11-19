import { Router } from 'express'
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js'
import { registerUser, loginUser, getCurrentUser, forgetPassword, editProfile } from '../controllers/user.controller.js'

const router = Router()
router.post('/registeruser',  registerUser)
router.post('/loginuser', loginUser)
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current authenticated user's profile
 *     description: Fetches the complete profile, rewards, and leaderboard information for the user authenticated via Supabase JWT.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile fetched successfully.
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
 *                   example: "User profile fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5f2b4a6d5f2b4a6d5f2b4"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         fullname:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           enum: [user, admin, superadmin]
 *                           example: "user"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+1234567890"
 *                         profilePictureUrl:
 *                           type: string
 *                           format: uri
 *                           example: "https://example.com/avatar.png"
 *                         currentClassId:
 *                           type: string
 *                           example: "primary-1"
 *                         educationLevel:
 *                           type: string
 *                           enum: [primary, junior-secondary, senior-secondary]
 *                           example: "primary"
 *                         hasCompletedOnboarding:
 *                           type: boolean
 *                           example: true
 *                     rewards:
 *                       type: object
 *                       properties:
 *                         totalCoins:
 *                           type: integer
 *                           example: 150
 *                         totalPoints:
 *                           type: integer
 *                           example: 500
 *                         totalDiamonds:
 *                           type: integer
 *                           example: 10
 *                         spinChances:
 *                           type: integer
 *                           example: 2
 *                         currentStreak:
 *                           type: integer
 *                           example: 5
 *                     leaderboard:
 *                       type: object
 *                       properties:
 *                         totalPoints:
 *                           type: integer
 *                           example: 500
 *                         rank:
 *                           type: integer
 *                           example: 42
 *       '401':
 *         description: Not authenticated.
 *       '404':
 *         description: User profile not found.
 */
router.get('/me', requireSupabaseUser, getCurrentUser)
router.post('/resetpassword', forgetPassword)
router.post('/editprofile', editProfile)
// router.put('/update', requireSupabaseUser, updateUserDetails)
// router.delete('/delete', requireSupabaseUser, deleteUser)
// router.put('/changepassword', requireSupabaseUser, changeUserCurrentPassword)
// router.post('/logout', requireSupabaseUser, logoutUser)
// router.post('/recover', requestPasswordRecovery);
// router.post('/resetpassword', resetPassword);


export default router