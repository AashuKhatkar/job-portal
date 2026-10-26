import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    closeJob,
    getJobApplicants,
    getMyJobs
} from '../controllers/jobController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Candidate job search
router.get('/', getJobs);
router.get('/my/listings', authenticate, requireRole('recruiter', 'admin'), getMyJobs);
router.get('/:id', getJobById);

// Recruiter operations
router.post('/', authenticate, requireRole('recruiter', 'admin'), createJob);
router.patch('/:id', authenticate, requireRole('recruiter', 'admin'), updateJob);
router.patch('/:id/close', authenticate, requireRole('recruiter', 'admin'), closeJob);
router.get('/:id/applicants', authenticate, requireRole('recruiter', 'admin'), getJobApplicants);

// Backward compatibility routes for legacy frontend paths
router.get('/all-jobs', getJobs);
router.get('/current-job/:id', getJobById);
router.post('/post-job', authenticate, requireRole('recruiter', 'admin'), createJob);

export default router;