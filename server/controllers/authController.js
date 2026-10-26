import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CandidateProfile from '../models/CandidateProfile.js';

const secret = process.env.JWT_SECRET || "atsjwtkey";

const createToken = (userId, role) => {
    return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'candidate', companyName } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        const validRoles = ['candidate', 'recruiter', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'candidate';

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: userRole,
            companyName: userRole === 'recruiter' ? (companyName || 'TechCorp') : ''
        });

        // Initialize candidate profile if role is candidate
        if (userRole === 'candidate') {
            await CandidateProfile.create({
                userId: newUser._id,
                headline: 'Aspiring Professional',
                skills: [],
                education: [],
                resumes: []
            });
        }

        const token = createToken(newUser._id, newUser.role);
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                companyName: newUser.companyName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error during registration.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = createToken(user._id, user.role);
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
};

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                companyName: req.user.companyName
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve current user.' });
    }
};
