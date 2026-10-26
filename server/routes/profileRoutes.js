import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getMyProfile);
router.put('/', authenticate, requireRole('candidate'), updateMyProfile);

export default router;
