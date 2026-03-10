const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect } = require('../middleware/auth');

// Helper: get current month key "YYYY-MM"
function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper: get current day key "YYYY-MM-DD"
function getDayKey() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Ensure a single Visitor document exists
async function getVisitorDoc() {
    let doc = await Visitor.findOne();
    if (!doc) {
        doc = await Visitor.create({});
    }
    return doc;
}

// @route   POST /api/visitors/track
// @desc    Track a visitor session (public)
// @access  Public
router.post('/track', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'Session ID required.' });
        }

        const doc = await getVisitorDoc();
        const monthKey = getMonthKey();
        const dayKey = getDayKey();

        // Only count unique sessions
        const isNew = !doc.activeSessions.includes(sessionId);

        if (isNew) {
            // Add session
            doc.activeSessions.push(sessionId);

            // Limit active sessions list to last 500
            if (doc.activeSessions.length > 500) {
                doc.activeSessions = doc.activeSessions.slice(-500);
            }

            // Increment totals
            doc.total += 1;
            doc.monthly.set(monthKey, (doc.monthly.get(monthKey) || 0) + 1);
            doc.daily.set(dayKey, (doc.daily.get(dayKey) || 0) + 1);
            doc.lastUpdated = new Date();

            await doc.save();
        }

        const monthlyCount = doc.monthly.get(monthKey) || 0;
        const dailyCount = doc.daily.get(dayKey) || 0;
        const current = doc.activeSessions.length;

        res.json({
            success: true,
            isNew,
            stats: {
                total: doc.total,
                monthly: monthlyCount,
                daily: dailyCount,
                current,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   GET /api/visitors
// @desc    Get visitor stats (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const doc = await getVisitorDoc();
        const monthKey = getMonthKey();
        const dayKey = getDayKey();

        res.json({
            success: true,
            stats: {
                total: doc.total,
                monthly: doc.monthly.get(monthKey) || 0,
                daily: doc.daily.get(dayKey) || 0,
                current: doc.activeSessions.length,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   GET /api/visitors/admin
// @desc    Get detailed visitor analytics (admin only)
// @access  Private
router.get('/admin', protect, async (req, res) => {
    try {
        const doc = await getVisitorDoc();

        // Get last 12 months
        const monthlyData = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = doc.monthly.get(key) || 0;
        }

        // Get last 7 days
        const dailyData = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyData[key] = doc.daily.get(key) || 0;
        }

        const monthKey = getMonthKey();
        const dayKey = getDayKey();

        res.json({
            success: true,
            stats: {
                total: doc.total,
                monthly: doc.monthly.get(monthKey) || 0,
                daily: doc.daily.get(dayKey) || 0,
                current: doc.activeSessions.length,
                monthlyData,
                dailyData,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
