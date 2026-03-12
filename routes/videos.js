const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protectAny } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().sort({ addedAt: -1 });
        res.json({ success: true, count: videos.length, data: videos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', protectAny('videos'), async (req, res) => {
    try {
        const { title, youtubeUrl, youtubeId, description } = req.body;
        if (!title || !youtubeUrl || !youtubeId)
            return res.status(400).json({ success: false, message: 'Title, URL and YouTube ID required' });
        const video = await Video.create({ title, youtubeUrl, youtubeId, description });
        res.status(201).json({ success: true, data: video });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', protectAny('videos'), async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
        res.json({ success: true, message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
