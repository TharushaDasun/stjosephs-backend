const express = require('express');
const router = express.Router();
const LiveStream = require('../models/LiveStream');
const { protect } = require('../middleware/auth');

// Helper: extract YouTube video ID from a URL
function extractYouTubeId(url) {
    if (!url) return '';
    const patterns = [
        /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return '';
}

// Ensure a single LiveStream document exists
async function getLiveStreamDoc() {
    let doc = await LiveStream.findOne();
    if (!doc) {
        doc = await LiveStream.create({ active: false });
    }
    return doc;
}

// @route   GET /api/livestream
// @desc    Get current live stream status (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const stream = await getLiveStreamDoc();
        res.json({ success: true, data: stream });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   PUT /api/livestream
// @desc    Update live stream settings (admin only)
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        const { active, title, description, youtubeUrl, thumbnail } = req.body;

        const stream = await getLiveStreamDoc();

        const videoId = extractYouTubeId(youtubeUrl || stream.youtubeUrl);

        stream.active = active !== undefined ? active : stream.active;
        stream.title = title !== undefined ? title : stream.title;
        stream.description = description !== undefined ? description : stream.description;
        stream.youtubeUrl = youtubeUrl !== undefined ? youtubeUrl : stream.youtubeUrl;
        stream.youtubeVideoId = videoId;
        stream.thumbnail = thumbnail !== undefined ? thumbnail : stream.thumbnail;
        stream.updatedAt = new Date();

        if (active === true && !stream.startTime) {
            stream.startTime = new Date();
        }
        if (active === false) {
            stream.startTime = null;
        }

        await stream.save();

        res.json({ success: true, data: stream });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   POST /api/livestream/go-live
// @desc    Quickly start a live stream (admin only)
// @access  Private
router.post('/go-live', protect, async (req, res) => {
    try {
        const { title, description, youtubeUrl, thumbnail } = req.body;

        if (!youtubeUrl) {
            return res.status(400).json({ success: false, message: 'YouTube URL is required to go live.' });
        }

        const videoId = extractYouTubeId(youtubeUrl);

        const stream = await getLiveStreamDoc();

        stream.active = true;
        stream.title = title || 'Live Now';
        stream.description = description || '';
        stream.youtubeUrl = youtubeUrl;
        stream.youtubeVideoId = videoId;
        stream.thumbnail = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        stream.startTime = new Date();
        stream.updatedAt = new Date();

        await stream.save();

        res.json({ success: true, message: 'Live stream started!', data: stream });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   POST /api/livestream/end
// @desc    End the live stream (admin only)
// @access  Private
router.post('/end', protect, async (req, res) => {
    try {
        const stream = await getLiveStreamDoc();

        stream.active = false;
        stream.startTime = null;
        stream.updatedAt = new Date();

        await stream.save();

        res.json({ success: true, message: 'Live stream ended.', data: stream });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
