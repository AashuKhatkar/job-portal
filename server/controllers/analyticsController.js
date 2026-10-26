import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// GET /api/analytics/recruiter (Recruiter funnel analytics using MongoDB aggregation pipelines)
export const getRecruiterAnalytics = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        // Find jobs owned by this recruiter
        const jobs = await Job.find({ recruiterId });
        const jobIds = jobs.map(j => j._id);

        if (jobIds.length === 0) {
            return res.status(200).json({
                totalJobs: 0,
                activeJobs: 0,
                totalApplications: 0,
                funnel: {
                    applied: 0,
                    shortlisted: 0,
                    interview: 0,
                    offered: 0,
                    rejected: 0
                },
                conversionRate: 0
            });
        }

        // Aggregation pipeline: Count applications by stage
        const stageCounts = await Application.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            { $group: { _id: '$stage', count: { $sum: 1 } } }
        ]);

        const funnel = {
            applied: 0,
            shortlisted: 0,
            interview: 0,
            offered: 0,
            rejected: 0
        };

        let totalApplications = 0;
        stageCounts.forEach(item => {
            if (funnel[item._id] !== undefined) {
                funnel[item._id] = item.count;
            }
            totalApplications += item.count;
        });

        const activeJobs = jobs.filter(j => j.status === 'active').length;
        const conversionRate = totalApplications > 0
            ? Math.round((funnel.offered / totalApplications) * 100)
            : 0;

        return res.status(200).json({
            totalJobs: jobs.length,
            activeJobs,
            totalApplications,
            funnel,
            conversionRate
        });
    } catch (error) {
        console.error('getRecruiterAnalytics error:', error);
        return res.status(500).json({ error: 'Failed to compute recruiter analytics.' });
    }
};

// GET /api/analytics/admin (Platform-wide analytics)
export const getAdminAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            candidatesCount,
            recruitersCount,
            totalJobs,
            activeJobs,
            totalApplications,
            stageAggregation
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'candidate' }),
            User.countDocuments({ role: 'recruiter' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'active' }),
            Application.countDocuments(),
            Application.aggregate([
                { $group: { _id: '$stage', count: { $sum: 1 } } }
            ])
        ]);

        const stageBreakdown = {};
        stageAggregation.forEach(item => {
            stageBreakdown[item._id] = item.count;
        });

        return res.status(200).json({
            users: {
                total: totalUsers,
                candidates: candidatesCount,
                recruiters: recruitersCount
            },
            jobs: {
                total: totalJobs,
                active: activeJobs
            },
            applications: {
                total: totalApplications,
                stageBreakdown
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to compute admin analytics.' });
    }
};
