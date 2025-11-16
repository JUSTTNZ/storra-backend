import { Router } from 'express';
import multer from 'multer';
import { uploadProfilePicture } from '../controllers/profile.controller.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-profile', upload.single('profile'), uploadProfilePicture);

export default router;
