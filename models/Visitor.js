const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    // Total all-time unique sessions
    total: {
        type: Number,
        default: 0,
    },
    // Monthly counts: { "2024-01": 120, "2024-02": 200 }
    monthly: {
        type: Map,
        of: Number,
        default: {},
    },
    // Daily counts: { "2024-01-15": 30 }
    daily: {
        type: Map,
        of: Number,
        default: {},
    },
    // Active session IDs (auto-expires handled by cleanup)
    activeSessions: {
        type: [String],
        default: [],
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
