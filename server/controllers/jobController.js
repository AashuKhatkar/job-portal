import Job from '../models/Job.js';
import Application from '../models/Application.js';
import CandidateProfile from '../models/CandidateProfile.js';

// GET /api/jobs (Faceted search with filters, compound index querying, and pagination)
export const getJobs = async (req, res) => {
    try {
        const {
            role,
            search,
            location,
            minExp,
            ctc,
            skills,
            workMode,
            status = 'active',
            page = 1,
            limit = 10,
            sort = 'createdAt'
        } = req.query;

        const query = {};

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Text search or role title match
        if (role || search) {
            const searchTerm = (role || search).trim();
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { companyName: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Location filter
        if (location) {
            query.location = { $regex: location.trim(), $options: 'i' };
        }

        // Work mode filter (Remote, On-site, Hybrid)
        if (workMode && workMode !== 'all') {
            query.workMode = workMode;
        }

        // Minimum experience filter
        if (minExp !== undefined && minExp !== '') {
            query.minExp = { $lte: Number(minExp) };
        }

        // CTC filter (max budget >= requested CTC)
        if (ctc !== undefined && ctc !== '') {
            query['ctcRange.max'] = { $gte: Number(ctc) };
        }

        // Skills filter (faceted array matching)
        if (skills) {
            const skillsList = Array.isArray(skills) 
                ? skills 
                : skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsList.length > 0) {
                query.skills = { $in: skillsList.map(s => new RegExp(`^${s}$`, 'i')) };
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const [jobs, totalCount] = await Promise.all([
            Job.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .populate('recruiterId', 'name email companyName'),
            Job.countDocuments(query)
        ]);

        return res.status(200).json({
            jobs,
            pagination: {
                totalCount,
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / Number(limit)),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('getJobs error:', error);
        return res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
};

// GET /api/jobs/:id
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('recruiterId', 'name email companyName');
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        return res.status(200).json(job);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch job details.' });
    }
};

// POST /api/jobs (recruiter only)
export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            skills = [],
            location,
            workMode = 'On-site',
            minExp = 0,
            ctcRange = { min: 0, max: 0 },
            deadline
        } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ error: 'Title, description, and location are required.' });
        }

        const normalizedSkills = Array.isArray(skills)
            ? skills.map(s => s.trim()).filter(Boolean)
            : String(skills).split(',').map(s => s.trim()).filter(Boolean);

        const newJob = await Job.create({
            recruiterId: req.user._id,
            companyName: req.user.companyName || 'TechCorp',
            title,
            description,
            skills: normalizedSkills,
            location,
            workMode,
            minExp: Number(minExp) || 0,
            ctcRange: {
                min: Number(ctcRange?.min) || 0,
                max: Number(ctcRange?.max) || 0
            },
            status: 'active',
            deadline: deadline ? new Date(deadline) : null
        });

        return res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } catch (error) {
        console.error('createJob error:', error);
        return res.status(500).json({ error: 'Failed to create job posting.' });
    }
};

// PATCH /api/jobs/:id (owner recruiter or admin only - IDOR protected)
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        // IDOR Check: Ensure requester is the job's recruiter or admin
        if (req.user.role !== 'admin' && String(job.recruiterId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden. You do not own this job posting.' });
        }

        const allowedFields = ['title', 'description', 'skills', 'location', 'workMode', 'minExp', 'ctcRange', 'status', 'deadline'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();
        return res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update job.' });
    }
};

// PATCH /api/jobs/:id/close (owner recruiter or admin only - IDOR protected)
export const closeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        if (req.user.role !== 'admin' && String(job.recruiterId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden. You can only close your own job postings.' });
        }

        job.status = 'closed';
        await job.save();

        return res.status(200).json({ message: 'Job closed successfully', job });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to close job.' });
    }
};

// GET /api/jobs/:id/applicants (recruiter of that job only - IDOR protected)
export const getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        // IDOR Check: Recruiter can only view applicants for jobs they own
        if (req.user.role !== 'admin' && String(job.recruiterId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to view applicants for this job.' });
        }

        const applications = await Application.find({ jobId: job._id })
            .populate('candidateId', 'name email createdAt')
            .sort({ createdAt: -1 });

        // Augment applicants with candidate profile details (skills match score & resume)
        const candidateIds = applications.map(app => app.candidateId?._id).filter(Boolean);
        const profiles = await CandidateProfile.find({ userId: { $in: candidateIds } });
        const profileMap = new Map(profiles.map(p => [String(p.userId), p]));

        const rankedApplicants = applications.map(app => {
            const candidate = app.candidateId;
            const profile = candidate ? profileMap.get(String(candidate._id)) : null;

            // Calculate skill match score
            let matchScore = 0;
            if (profile && profile.skills && job.skills && job.skills.length > 0) {
                const jobSkillsLower = job.skills.map(s => s.toLowerCase());
                const matchingSkills = profile.skills.filter(s => jobSkillsLower.includes(s.toLowerCase()));
                matchScore = Math.round((matchingSkills.length / job.skills.length) * 100);
            }

            return {
                applicationId: app._id,
                stage: app.stage,
                stageHistory: app.stageHistory,
                recruiterNotes: app.recruiterNotes,
                coverNote: app.coverNote,
                resumeUrl: app.resumeUrl,
                appliedAt: app.createdAt,
                candidate: {
                    id: candidate?._id,
                    name: candidate?.name,
                    email: candidate?.email,
                    headline: profile?.headline || 'Candidate',
                    experienceYears: profile?.experienceYears || 0,
                    skills: profile?.skills || [],
                    expectedCtc: profile?.expectedCtc || 0,
                    education: profile?.education || []
                },
                matchScore
            };
        });

        // Sort by match score descending by default
        rankedApplicants.sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({
            job: {
                id: job._id,
                title: job.title,
                companyName: job.companyName,
                skills: job.skills,
                location: job.location,
                status: job.status
            },
            applicants: rankedApplicants,
            totalCount: rankedApplicants.length
        });
    } catch (error) {
        console.error('getJobApplicants error:', error);
        return res.status(500).json({ error: 'Failed to fetch applicants.' });
    }
};

// GET /api/jobs/my/listings (recruiter's own posted jobs)
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });

        // Get applicant counts per job
        const jobIds = jobs.map(j => j._id);
        const applicationCounts = await Application.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            { $group: { _id: '$jobId', count: { $sum: 1 } } }
        ]);
        const countMap = new Map(applicationCounts.map(item => [String(item._id), item.count]));

        const jobsWithCounts = jobs.map(j => ({
            ...j.toObject(),
            applicantCount: countMap.get(String(j._id)) || 0
        }));

        return res.status(200).json(jobsWithCounts);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch your jobs.' });
    }
};
