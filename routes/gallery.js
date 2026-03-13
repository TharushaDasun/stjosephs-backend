const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const { uploadGallery, cloudinary } = require('../config/cloudinary');

// GET all gallery photos (public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category && category !== 'all' ? { category } : {};
        const photos = await Gallery.find(filter).sort({ uploadedAt: -1 });
        res.json({ success: true, count: photos.length, data: photos });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST upload gallery item with up to 3 photos
router.post('/', protect, uploadGallery.fields([
    { name: 'photo',  maxCount: 1 },
    { name: 'photo2', maxCount: 1 },
    { name: 'photo3', maxCount: 1 },
]), async (req, res) => {
    try {
        if (!req.files || !req.files['photo']) {
            return res.status(400).json({ success: false, message: 'Main photo required.' });
        }
        const { title, description, category, facebookUrl, youtubeUrl } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title required.' });

        const main   = req.files['photo'][0];
        const extra2 = req.files['photo2']?.[0];
        const extra3 = req.files['photo3']?.[0];

        const photo = await Gallery.create({
            title,
            description:  description || '',
            category:     category || 'events',
            imageUrl:     main.path,
            cloudinaryId: main.filename,
            imageUrl2:    extra2 ? extra2.path     : '',
            cloudinaryId2:extra2 ? extra2.filename : '',
            imageUrl3:    extra3 ? extra3.path     : '',
            cloudinaryId3:extra3 ? extra3.filename : '',
            facebookUrl:  facebookUrl || '',
            youtubeUrl:   youtubeUrl  || '',
        });

        res.status(201).json({ success: true, data: photo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// PUT edit metadata
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, description, category, facebookUrl, youtubeUrl } = req.body;
        const photo = await Gallery.findByIdAndUpdate(
            req.params.id,
            { title, description, category, facebookUrl, youtubeUrl },
            { new: true, runValidators: true }
        );
        if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });
        res.json({ success: true, data: photo });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// DELETE photo + all cloudinary images
router.delete('/:id', protect, async (req, res) => {
    try {
        const photo = await Gallery.findById(req.params.id);
        if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

        const ids = [photo.cloudinaryId, photo.cloudinaryId2, photo.cloudinaryId3].filter(Boolean);
        await Promise.all(ids.map(id => cloudinary.uploader.destroy(id)));

        await photo.deleteOne();
        res.json({ success: true, message: 'Photo deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
