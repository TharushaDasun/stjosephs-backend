const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Photo title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    category: {
        type: String,
        enum: ['events', 'sports', 'cultural', 'academic', 'other'],
        default: 'events',
    },
    imageUrl: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: true,
    },
    facebookUrl: {
        type: String,
        default: '',
    },
    youtubeUrl: {
        type: String,
        default: '',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
