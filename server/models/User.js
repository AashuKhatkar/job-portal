import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['candidate', 'recruiter', 'admin'],
        default: 'candidate'
    },
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    companyId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

export default User;