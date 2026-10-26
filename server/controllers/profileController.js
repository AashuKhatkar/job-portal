import CandidateProfile from '../models/CandidateProfile.js';

// GET /api/profile
export const getMyProfile = async (req, res) => {
    try {
        let profile = await CandidateProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = await CandidateProfile.create({
                userId: req.user._id,
                headline: 'Candidate',
                skills: [],
                education: [],
                resumes: []
            });
        }
        return res.status(200).json(profile);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
};

// PUT /api/profile
export const updateMyProfile = async (req, res) => {
    try {
        const { headline, skills, experienceYears, education, expectedCtc, portfolioLinks } = req.body;

        let profile = await CandidateProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = new CandidateProfile({ userId: req.user._id });
        }

        if (headline !== undefined) profile.headline = headline;
        if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
        if (expectedCtc !== undefined) profile.expectedCtc = Number(expectedCtc);

        if (skills !== undefined) {
            profile.skills = Array.isArray(skills)
                ? skills.map(s => s.trim()).filter(Boolean)
                : String(skills).split(',').map(s => s.trim()).filter(Boolean);
        }

        if (education !== undefined) {
            profile.education = education;
        }

        if (portfolioLinks !== undefined) {
            profile.portfolioLinks = Array.isArray(portfolioLinks)
                ? portfolioLinks
                : String(portfolioLinks).split(',').map(s => s.trim()).filter(Boolean);
        }

        await profile.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('updateMyProfile error:', error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
};
