const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Update last login time
        admin.lastLogin = new Date();
        await admin.save();

        res.json({
            success: true,
            token: generateToken(admin._id),
            admin: {
                id: admin._id,
                username: admin.username,
                lastLogin: admin.lastLogin,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in admin
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        admin: {
            id: req.admin._id,
            username: req.admin.username,
            lastLogin: req.admin.lastLogin,
        },
    });
});

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Private
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
