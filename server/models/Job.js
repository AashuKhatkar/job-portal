import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    companyId: {
        type: String,
        default: ''
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        required: true,
        trim: true
    },
    workMode: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'On-site'
    },
    minExp: {
        type: Number,
        default: 0
    },
    ctcRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    deadline: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index for faceted search
JobSchema.index({ skills: 1, location: 1, minExp: 1, status: 1 });
JobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.model('Job', JobSchema);

export default Job;