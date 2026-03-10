const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { uploadEvent, cloudinary } = require('../config/cloudinary');

// @route   GET /api/events
// @desc    Get all events (public) — upcoming by default
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { all } = req.query;
        const now = new Date();

        // By default, return only upcoming events
        const filter = all === 'true' ? {} : { date: { $gte: now } };

        const events = await Event.find(filter).sort({ date: 1 });

        res.json({ success: true, count: events.length, data: events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   POST /api/events
// @desc    Create a new event (admin only)
// @access  Private
router.post('/', protect, uploadEvent.single('image'), async (req, res) => {
    try {
        const { title, description, date, time, location, category } = req.body;

        if (!title || !date) {
            return res.status(400).json({ success: false, message: 'Title and date are required.' });
        }

        const eventData = {
            title,
            description: description || '',
            date: new Date(date),
            time: time || '',
            location: location || '',
            category: category || 'other',
        };

        if (req.file) {
            eventData.imageUrl = req.file.path;
            eventData.cloudinaryId = req.file.filename;
        }

        const event = await Event.create(eventData);

        res.status(201).json({ success: true, data: event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event (admin only)
// @access  Private
router.put('/:id', protect, uploadEvent.single('image'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const { title, description, date, time, location, category } = req.body;

        const updateData = {
            title: title || event.title,
            description: description !== undefined ? description : event.description,
            date: date ? new Date(date) : event.date,
            time: time !== undefined ? time : event.time,
            location: location !== undefined ? location : event.location,
            category: category || event.category,
        };

        if (req.file) {
            // Delete old image from Cloudinary
            if (event.cloudinaryId) {
                await cloudinary.uploader.destroy(event.cloudinaryId);
            }
            updateData.imageUrl = req.file.path;
            updateData.cloudinaryId = req.file.filename;
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: updatedEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (admin only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // Delete image from Cloudinary if exists
        if (event.cloudinaryId) {
            await cloudinary.uploader.destroy(event.cloudinaryId);
        }

        await event.deleteOne();

        res.json({ success: true, message: 'Event deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
