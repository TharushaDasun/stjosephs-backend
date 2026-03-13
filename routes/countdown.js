const express = require('express');
const router  = express.Router();
const Countdown = require('../models/Countdown');
const { protect } = require('../middleware/auth');

// GET current countdown (public)
router.get('/', async (req, res) => {
    try {
        const cd = await Countdown.findOne().sort({ updatedAt: -1 });
        res.json({ success: true, data: cd || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST save/update countdown (admin only)
router.post('/', protect, async (req, res) => {
    try {
        const { eventTitle, label, targetDate, visible } = req.body;
        let cd = await Countdown.findOne();
        if (cd) {
            cd.eventTitle = eventTitle;
            cd.label      = label || 'Upcoming Event';
            cd.targetDate = new Date(targetDate);
            cd.visible    = visible !== false;
            cd.updatedAt  = new Date();
            await cd.save();
        } else {
            cd = await Countdown.create({ eventTitle, label, targetDate, visible });
        }
        res.json({ success: true, data: cd });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
