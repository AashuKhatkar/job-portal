import mongoose from 'mongoose';

const CandidateProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    headline: {
        type: String,
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    education: [{
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number }
    }],
    resumes: [{
        url: { type: String, required: true },
        name: { type: String, required: true },
        fileId: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    expectedCtc: {
        type: Number,
        default: 0
    },
    portfolioLinks: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

CandidateProfileSchema.index({ skills: 1 });

const CandidateProfile = mongoose.model('CandidateProfile', CandidateProfileSchema);

export default CandidateProfile;
