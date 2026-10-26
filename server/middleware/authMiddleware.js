import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || "atsjwtkey";

// Authenticate user from Authorization Header (Bearer token) or cookie
export const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.userId).select('-passwordHash');

        if (!user) {
            return res.status(401).json({ error: 'User not found or token invalid.' });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// Role-based access control middleware
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Forbidden. Role '${req.user.role}' does not have access to this resource.`
            });
        }

        next();
    };
};
