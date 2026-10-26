import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import { sendStageChangeEmail } from '../utils/emailService.js';

// Valid transitions in the hiring state machine
const PERMITTED_TRANSITIONS = {
    applied: ['shortlisted', 'rejected'],
    shortlisted: ['interview', 'rejected'],
    interview: ['offered', 'rejected'],
    offered: ['rejected'], // Or hired/accepted
    rejected: ['applied']   // Allow reopening if necessary
};

// POST /api/applications (candidate only - duplicate prevention enforced by DB unique index)
export const applyForJob = async (req, res) => {
    try {
        const { jobId, resumeUrl, coverNote } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required.' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        if (job.status === 'closed') {
            return res.status(400).json({ error: 'This job posting is closed and no longer accepting applications.' });
        }

        // Determine resume URL from body or candidate's profile
        let finalResumeUrl = resumeUrl;
        if (!finalResumeUrl) {
            const profile = await CandidateProfile.findOne({ userId: req.user._id });
            if (profile && profile.resumes && profile.resumes.length > 0) {
                finalResumeUrl = profile.resumes[0].url;
            }
        }

        if (!finalResumeUrl) {
            return res.status(400).json({ error: 'Please upload a resume or provide a resume URL to apply.' });
        }

        const newApplication = await Application.create({
            jobId: job._id,
            candidateId: req.user._id,
            resumeUrl: finalResumeUrl,
            coverNote: coverNote || '',
            stage: 'applied',
            stageHistory: [{
                stage: 'applied',
                changedAt: new Date(),
                changedBy: req.user._id,
                note: 'Application submitted by candidate.'
            }]
        });

        return res.status(201).json({
            message: 'Application submitted successfully',
            application: newApplication
        });
    } catch (error) {
        // MongoDB duplicate key error code 11000 from unique compound index { jobId: 1, candidateId: 1 }
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'You have already applied for this job. Duplicate applications are not allowed.'
            });
        }
        console.error('applyForJob error:', error);
        return res.status(500).json({ error: 'Failed to submit application.' });
    }
};

// GET /api/applications/me (candidate's own applications tracker)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title companyName location workMode ctcRange status deadline')
            .sort({ createdAt: -1 });

        return res.status(200).json(applications);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch your applications.' });
    }
};

// PATCH /api/applications/:id/stage (recruiter of that job only - state machine transition check)
export const updateApplicationStage = async (req, res) => {
    try {
        const { stage, note } = req.body;
        const validStages = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];

        if (!stage || !validStages.includes(stage)) {
            return res.status(400).json({
                error: `Invalid stage. Must be one of: ${validStages.join(', ')}`
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('jobId')
            .populate('candidateId', 'name email');

        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        const job = application.jobId;

        // IDOR Check: Ensure recruiter owns this job or is admin
        if (req.user.role !== 'admin' && String(job.recruiterId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden. You do not own the job associated with this application.' });
        }

        const currentStage = application.stage;

        // Enforce state machine transitions
        if (currentStage !== stage) {
            const allowedNextStages = PERMITTED_TRANSITIONS[currentStage] || [];
            if (!allowedNextStages.includes(stage) && req.user.role !== 'admin') {
                return res.status(400).json({
                    error: `Invalid stage transition from '${currentStage}' to '${stage}'. Permitted transitions: ${allowedNextStages.join(', ')}`
                });
            }

            application.stage = stage;
            application.stageHistory.push({
                stage,
                changedAt: new Date(),
                changedBy: req.user._id,
                note: note || `Status updated from ${currentStage} to ${stage}`
            });

            await application.save();

            // Dispatch status-change notification email
            if (application.candidateId?.email) {
                sendStageChangeEmail({
                    candidateEmail: application.candidateId.email,
                    candidateName: application.candidateId.name,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    oldStage: currentStage,
                    newStage: stage,
                    note
                });
            }
        }

        return res.status(200).json({
            message: `Application moved to '${stage}' stage.`,
            application
        });
    } catch (error) {
        console.error('updateApplicationStage error:', error);
        return res.status(500).json({ error: 'Failed to update application stage.' });
    }
};

// POST /api/applications/:id/notes (recruiter internal notes)
export const addRecruiterNote = async (req, res) => {
    try {
        const { note } = req.body;
        if (!note || !note.trim()) {
            return res.status(400).json({ error: 'Note content cannot be empty.' });
        }

        const application = await Application.findById(req.params.id).populate('jobId');
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // IDOR Check
        if (req.user.role !== 'admin' && String(application.jobId.recruiterId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden. You do not own this job application.' });
        }

        application.recruiterNotes.push({
            note: note.trim(),
            author: req.user.name || 'Recruiter',
            createdAt: new Date()
        });

        await application.save();

        return res.status(200).json({
            message: 'Note added successfully',
            notes: application.recruiterNotes
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add recruiter note.' });
    }
};
