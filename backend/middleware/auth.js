const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT token in the Authorization header.
 * Attaches the full user document (minus password) to req.user.
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ── Admin is env-based, has no MongoDB document ──────────────────────
        // Trying User.findById('admin') causes a Mongoose CastError → 401.
        // Short-circuit: attach a synthetic admin object and continue.
        if (decoded.role === 'admin') {
            req.user = {
                _id: 'admin',
                id: 'admin',
                username: 'Admin',
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
            };
            return next();
        }

        // ── Regular DB user ───────────────────────────────────────────────────
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('admin') or requireRole('admin', 'user')
 * Must be used AFTER authMiddleware so req.user is populated.
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${roles.join(', ')}`,
            });
        }
        next();
    };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
