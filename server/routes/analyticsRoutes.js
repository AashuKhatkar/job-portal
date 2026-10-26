import express from 'express';
import { getRecruiterAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/recruiter', authenticate, requireRole('recruiter', 'admin'), getRecruiterAnalytics);
router.get('/admin', authenticate, requireRole('admin'), getAdminAnalytics);

export default router;
