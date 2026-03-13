const mongoose = require('mongoose');

const CountdownSchema = new mongoose.Schema({
    eventTitle:  { type: String, default: '' },
    label:       { type: String, default: 'Upcoming Event' },
    targetDate:  { type: Date, required: true },
    visible:     { type: Boolean, default: true },
    updatedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Countdown', CountdownSchema);
