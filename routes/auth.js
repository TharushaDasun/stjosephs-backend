const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id, role = 'main') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Helper: get client IP
const getIP = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || '';

// @route   POST /api/auth/login
// @desc    Login — main admin OR sub-admin
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    try {
        // 1. Try main admin
        // Admin.js has no select:false on password, so normal findOne works
        const admin = await Admin.findOne({ username });
        if (admin) {
            const isMatch = await admin.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }
            admin.lastLogin = new Date();
            await admin.save();

            await ActivityLog.create({
                user: username, role: 'main', type: 'login',
                category: 'login', details: 'Main admin login',
                ip: getIP(req),
            });

            return res.json({
                success: true,
                token: generateToken(admin._id, 'main'),
                admin: {
                    id: admin._id,
                    username: admin.username,
                    role: 'main',
                    lastLogin: admin.lastLogin,
                },
            });
        }

        // 2. Try sub-admin
        const sub = await SubAdmin.findOne({ username });
        if (sub) {
            if (!sub.active) {
                return res.status(401).json({ success: false, message: 'This account has been disabled.' });
            }
            const isMatch = await sub.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }
            sub.lastLogin = new Date();
            await sub.save();

            await ActivityLog.create({
                user: username, role: 'sub', type: 'login',
                category: 'login', details: 'Sub admin login',
                ip: getIP(req),
            });

            return res.json({
                success: true,
                token: generateToken(sub._id, 'sub'),
                admin: {
                    id: sub._id,
                    username: sub.username,
                    role: 'sub',
                    permissions: sub.permissions,
                    lastLogin: sub.lastLogin,
                },
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in admin (main or sub)
// @access  Private
router.get('/me', async (req, res) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'No token.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'sub') {
            const sub = await SubAdmin.findById(decoded.id);
            if (!sub || !sub.active) {
                return res.status(401).json({ success: false, message: 'Not found or disabled.' });
            }
            return res.json({
                success: true,
                admin: {
                    id: sub._id,
                    username: sub.username,
                    role: 'sub',
                    permissions: sub.permissions,
                    lastLogin: sub.lastLogin,
                },
            });
        }

        // Main admin
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ success: false, message: 'Admin not found.' });
        return res.json({
            success: true,
            admin: {
                id: admin._id,
                username: admin.username,
                role: 'main',
                lastLogin: admin.lastLogin,
            },
        });
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change main admin password
// @access  Private (main admin only)
router.put('/change-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const admin = await Admin.findById(req.admin._id);
        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }
        admin.password = newPassword;
        await admin.save();
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
