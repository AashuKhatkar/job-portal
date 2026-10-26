import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    coverNote: {
        type: String,
        default: ''
    },
    stage: {
        type: String,
        enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected'],
        default: 'applied',
        index: true
    },
    stageHistory: [{
        stage: {
            type: String,
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: {
            type: String
        }
    }],
    recruiterNotes: [{
        note: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Enforce duplicate-application prevention at database level
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;