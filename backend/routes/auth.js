const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
// Registration is ALWAYS role: "user" — admin cannot be created via registration.
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Block attempts to register with the predefined admin email
        if (email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase()) {
            return res.status(403).json({ message: 'This email cannot be used for registration' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Force role = 'user' regardless of anything in the request body
        const user = new User({ username, email, password, role: 'user' });
        await user.save();

        const token = generateToken({ id: user._id, role: user.role });

        res.status(201).json({
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
// If credentials match the predefined ADMIN_EMAIL/ADMIN_PASSWORD → sign as admin.
// Otherwise → look up from MongoDB and authenticate as 'user'.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

        // ── Admin credential check ──────────────────────────────────────────
        if (
            email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
            password === ADMIN_PASSWORD
        ) {
            const token = generateToken({ id: 'admin', role: 'admin' });
            return res.json({
                token,
                user: {
                    id: 'admin',
                    username: 'Admin',
                    email: ADMIN_EMAIL,
                    role: 'admin',
                },
            });
        }

        // ── Regular user login (MongoDB) ────────────────────────────────────
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Always enforce role = 'user' for DB users (belt-and-suspenders)
        const token = generateToken({ id: user._id, role: 'user' });

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, role: 'user' },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Admin has no DB document — return a synthetic profile
        if (decoded.role === 'admin') {
            return res.json({
                id: 'admin',
                username: 'Admin',
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
            });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user._id, username: user.username, email: user.email, role: 'user' });
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// PUT /api/auth/update-profile — protected, users only
router.put('/update-profile', authMiddleware, async (req, res) => {
    try {
        // Admin is env-based, has no DB document to update
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Admin profile cannot be updated here' });
        }

        const { username, email, password } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username && username.trim()) user.username = username.trim();
        if (email && email.trim()) {
            // Ensure email not taken by another user
            const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
            if (existing) return res.status(409).json({ message: 'Email already in use by another account' });
            user.email = email.toLowerCase().trim();
        }
        if (password && password.length >= 6) {
            user.password = password; // pre-save hook will hash it
        }

        await user.save();

        return res.json({
            user: { id: user._id, username: user.username, email: user.email, role: 'user' },
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/auth/me — alias for update-profile, called by frontend AuthContext
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Admin profile cannot be updated here' });
        }
        const { username, email, password } = req.body;
        const user = await User.findById(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username && username.trim()) user.username = username.trim();
        if (email && email.trim()) {
            const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
            if (existing) return res.status(409).json({ message: 'Email already in use' });
            user.email = email.toLowerCase().trim();
        }
        if (password && password.length >= 6) user.password = password;

        await user.save();
        res.json({ id: user._id, username: user.username, email: user.email, role: user.role });
    } catch (err) {
        console.error('PATCH /me error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
