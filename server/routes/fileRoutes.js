import express from 'express';
import { uploadResume, getSecureFile } from '../controllers/fileController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { resumeUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Upload resume: private documents, PDF/DOCX only, max 2MB
router.post(
    '/uploads/resume',
    authenticate,
    requireRole('candidate'),
    resumeUpload.single('file'),
    uploadResume
);

// Secure access-controlled download endpoint (signed token or authenticated owner/recruiter)
router.get(
    '/files/:filename',
    (req, res, next) => {
        // Optional auth: if authorization header or cookie is present, populate req.user
        if (req.headers.authorization || req.cookies?.token) {
            return authenticate(req, res, next);
        }
        next();
    },
    getSecureFile
);

export default router;
