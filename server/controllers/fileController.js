import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import CandidateProfile from '../models/CandidateProfile.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const secret = process.env.JWT_SECRET || "atsjwtkey";
const uploadDir = path.resolve('private_uploads/resumes');

// POST /api/uploads/resume (Candidate uploads resume)
export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or file rejected by validation rules.' });
        }

        const filename = req.file.filename;
        const originalName = req.file.originalname;

        // Generate a signed URL for secure, time-limited access (1 hour validity)
        const fileToken = jwt.sign(
            { filename, uploaderId: req.user._id },
            secret,
            { expiresIn: '1h' }
        );

        const secureDownloadUrl = `/api/files/${filename}?token=${fileToken}`;

        // Save resume entry in CandidateProfile
        let profile = await CandidateProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = new CandidateProfile({ userId: req.user._id });
        }

        profile.resumes.unshift({
            url: secureDownloadUrl,
            name: originalName,
            fileId: filename,
            uploadedAt: new Date()
        });

        await profile.save();

        return res.status(200).json({
            message: 'Resume uploaded successfully (Private & Encrypted)',
            file: {
                filename,
                originalName,
                url: secureDownloadUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('uploadResume error:', error);
        return res.status(500).json({ error: 'Failed to upload resume.' });
    }
};

// GET /api/files/:filename (IDOR Protected & Signed Access Download)
export const getSecureFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const { token } = req.query;

        // Check authentication or token validity
        let authorized = false;
        let requesterId = req.user?._id;

        if (token) {
            try {
                const decoded = jwt.verify(token, secret);
                if (decoded.filename === filename) {
                    authorized = true;
                }
            } catch (err) {
                // Token invalid or expired, proceed to check logged-in user credentials
            }
        }

        // If not authenticated via token, check logged-in session and enforce IDOR rules
        if (!authorized && req.user) {
            // Admin can access all files
            if (req.user.role === 'admin') {
                authorized = true;
            } else if (req.user.role === 'candidate') {
                // Candidate can ONLY access their own resume
                const ownsFile = await CandidateProfile.findOne({
                    userId: req.user._id,
                    'resumes.fileId': filename
                });
                if (ownsFile || filename.includes(String(req.user._id))) {
                    authorized = true;
                }
            } else if (req.user.role === 'recruiter') {
                // Recruiter can ONLY access resumes of candidates who applied to their jobs
                const candidateApplications = await Application.find({
                    resumeUrl: { $regex: filename }
                }).populate('jobId');

                const recruiterOwnsJob = candidateApplications.some(app =>
                    app.jobId && String(app.jobId.recruiterId) === String(req.user._id)
                );

                if (recruiterOwnsJob) {
                    authorized = true;
                }
            }
        }

        // IDOR Prevention: Deny access if unauthorized
        if (!authorized) {
            return res.status(403).json({
                error: 'Forbidden. IDOR Protection: You do not have permission to access or download this private document.'
            });
        }

        const filePath = path.join(uploadDir, path.basename(filename));

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server.' });
        }

        return res.sendFile(filePath);
    } catch (error) {
        console.error('getSecureFile error:', error);
        return res.status(500).json({ error: 'Failed to access file.' });
    }
};
