const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
    },
    time: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    imageUrl: {
        type: String,
        default: '',
    },
    cloudinaryId: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        enum: ['sports', 'cultural', 'academic', 'religious', 'other'],
        default: 'other',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
