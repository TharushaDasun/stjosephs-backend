const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// @route   POST /api/activitylog
// @desc    Add a log entry (called from frontend for gallery/events/video actions)
// @access  Private (main or sub - any valid token)
router.post('/', async (req, res) => {
    // Accept any valid JWT (main or sub)
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No token.' });
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    try {
        const { type, category, details, user, role } = req.body;
        if (!type || !category || !details) {
            return res.status(400).json({ success: false, message: 'type, category, details required.' });
        }

        const log = await ActivityLog.create({
            user:     user || decoded.username || 'unknown',
            role:     role || decoded.role || 'main',
            type,
            category,
            details,
            ip: req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || '',
        });

        res.status(201).json({ success: true, data: log });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/activitylog
// @desc    Get activity logs (main admin only)
// @access  Private (main admin)
router.get('/', protect, async (req, res) => {
    try {
        const { type, user, limit = 200 } = req.query;
        const filter = {};
        if (type && type !== 'all') filter.category = type;
        if (user && user !== 'all') filter.user = user;

        const logs = await ActivityLog.find(filter)
            .sort({ time: -1 })
            .limit(parseInt(limit));

        res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/activitylog/users
// @desc    Get unique users who have activity (main admin only)
// @access  Private (main admin)
router.get('/users', protect, async (req, res) => {
    try {
        const users = await ActivityLog.distinct('user');
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   DELETE /api/activitylog
// @desc    Clear all logs (main admin only)
// @access  Private (main admin)
router.delete('/', protect, async (req, res) => {
    try {
        await ActivityLog.deleteMany({});
        res.json({ success: true, message: 'All logs cleared.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
