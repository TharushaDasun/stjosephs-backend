const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protectAny } = require('../middleware/auth');
const { uploadGallery, cloudinary } = require('../config/cloudinary');

// @route   GET /api/gallery
// @desc    Get all gallery photos (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category && category !== 'all' ? { category } : {};

        const photos = await Gallery.find(filter).sort({ uploadedAt: -1 });

        res.json({ success: true, count: photos.length, data: photos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   POST /api/gallery
// @desc    Upload a new photo (admin only)
// @access  Private
router.post('/', protectAny('gallery'), uploadGallery.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file.' });
        }

        const { title, description, category, facebookUrl, youtubeUrl } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Photo title is required.' });
        }

        const photo = await Gallery.create({
            title,
            description: description || '',
            category: category || 'events',
            imageUrl: req.file.path,
            cloudinaryId: req.file.filename,
            facebookUrl: facebookUrl || '',
            youtubeUrl: youtubeUrl || '',
        });

        res.status(201).json({ success: true, data: photo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   PUT /api/gallery/:id
// @desc    Edit a photo entry (admin only)
// @access  Private
router.put('/:id', protectAny('gallery'), async (req, res) => {
    try {
        const { title, description, category, facebookUrl, youtubeUrl } = req.body;

        const photo = await Gallery.findByIdAndUpdate(
            req.params.id,
            { title, description, category, facebookUrl, youtubeUrl },
            { new: true, runValidators: true }
        );

        if (!photo) {
            return res.status(404).json({ success: false, message: 'Photo not found.' });
        }

        res.json({ success: true, data: photo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a photo (admin only)
// @access  Private
router.delete('/:id', protectAny('gallery'), async (req, res) => {
    try {
        const photo = await Gallery.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ success: false, message: 'Photo not found.' });
        }

        // Delete from Cloudinary
        if (photo.cloudinaryId) {
            await cloudinary.uploader.destroy(photo.cloudinaryId);
        }

        await photo.deleteOne();

        res.json({ success: true, message: 'Photo deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
