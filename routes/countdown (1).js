const express = require('express');
const router = express.Router();
const Countdown = require('../models/Countdown');
const auth = require('../middleware/auth');

// GET - public - get active countdown
router.get('/', async (req, res) => {
    try {
        const countdown = await Countdown.findOne({ active: true }).sort({ updatedAt: -1 });
        res.json({ success: true, data: countdown || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST - admin - create or update countdown
router.post('/', auth, async (req, res) => {
    try {
        const { title, subtitle, targetDate, active } = req.body;
        // Deactivate all existing
        await Countdown.updateMany({}, { active: false });
        const countdown = await Countdown.create({
            title, subtitle, targetDate, active: active !== false
        });
        res.json({ success: true, data: countdown });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT - admin - update
router.put('/:id', auth, async (req, res) => {
    try {
        const countdown = await Countdown.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json({ success: true, data: countdown });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE - admin
router.delete('/:id', auth, async (req, res) => {
    try {
        await Countdown.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Countdown deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
