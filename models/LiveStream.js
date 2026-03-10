const mongoose = require('mongoose');

const LiveStreamSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    youtubeUrl: {
        type: String,
        default: '',
    },
    // Extracted YouTube video ID
    youtubeVideoId: {
        type: String,
        default: '',
    },
    thumbnail: {
        type: String,
        default: '',
    },
    startTime: {
        type: Date,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('LiveStream', LiveStreamSchema);
