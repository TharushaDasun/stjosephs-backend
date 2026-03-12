const mongoose = require('mongoose');

const CountdownSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    targetDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Countdown', CountdownSchema);
