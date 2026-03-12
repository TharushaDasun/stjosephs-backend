const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['main', 'sub'],
        required: true,
    },
    type: {
        type: String,
        enum: ['login', 'logout', 'upload', 'delete', 'edit'],
        required: true,
    },
    category: {
        type: String,
        enum: ['login', 'upload', 'delete', 'edit'],
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        default: '',
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

// Auto-delete logs older than 90 days
ActivityLogSchema.index({ time: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
