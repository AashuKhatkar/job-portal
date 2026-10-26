import express from 'express';
import {
    applyForJob,
    getMyApplications,
    updateApplicationStage,
    addRecruiterNote
} from '../controllers/applicationController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Candidate operations
router.post('/', authenticate, requireRole('candidate'), applyForJob);
router.get('/me', authenticate, requireRole('candidate'), getMyApplications);

// Recruiter operations (IDOR protected in controller)
router.patch('/:id/stage', authenticate, requireRole('recruiter', 'admin'), updateApplicationStage);
router.post('/:id/notes', authenticate, requireRole('recruiter', 'admin'), addRecruiterNote);

// Backward compatibility routes
router.post('/post-application', authenticate, applyForJob);
router.get('/all-application', authenticate, getMyApplications);

export default router;