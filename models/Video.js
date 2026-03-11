const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String, required: true },
    description: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
