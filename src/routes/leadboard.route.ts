import { Router } from 'express'
import { requireSupabaseUser } from '../middlewares/supabaseAuth.js'
import {  getLeaderboard } from '../controllers/leadboard.controller.js'

const router = Router()
router.get('/',  getLeaderboard)




export default router